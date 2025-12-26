import {
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ArgumentsHost,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockHost: ArgumentsHost;
  let mockLogger: {
    error: jest.Mock;
    warn: jest.Mock;
    log: jest.Mock;
  };
  let mockConfigService: {
    get: jest.Mock;
  };

  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
  const mockGetRequest = jest
    .fn()
    .mockReturnValue({ url: '/test-path', id: 'test-request-id' });
  const mockSwitchToHttp = jest.fn().mockReturnValue({
    getResponse: mockGetResponse,
    getRequest: mockGetRequest,
  });

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('development'),
    };

    filter = new HttpExceptionFilter(
      mockLogger as unknown as Logger,
      mockConfigService as unknown as ConfigService,
    );

    mockHost = {
      switchToHttp: mockSwitchToHttp,
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ArgumentsHost;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException with object response', () => {
    const exception = new BadRequestException({
      message: 'Validation failed',
      error: 'Bad Request',
    });

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        error: 'Bad Request',
        path: '/test-path',
        requestId: 'test-request-id',
      }),
    );
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it('should handle HttpException with string message', () => {
    const exception = new NotFoundException('Resource not found');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        path: '/test-path',
      }),
    );
  });

  it('should handle HttpException with array message', () => {
    const exception = new BadRequestException({
      message: ['Field is required', 'Field must be a string'],
      error: 'Bad Request',
    });

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['Field is required', 'Field must be a string'],
      }),
    );
  });

  it('should handle generic Error in development mode', () => {
    const exception = new Error('Something went wrong');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
        error: 'Error',
      }),
    );
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should hide error details in production mode', () => {
    mockConfigService.get.mockReturnValue('production');
    const productionFilter = new HttpExceptionFilter(
      mockLogger as unknown as Logger,
      mockConfigService as unknown as ConfigService,
    );

    const exception = new Error('Database connection failed');

    productionFilter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'Internal Server Error',
      }),
    );
  });

  it('should handle unknown exception type', () => {
    const exception = 'Unknown error string';

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'Internal Server Error',
      }),
    );
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should log server errors (status >= 500)', () => {
    const exception = new HttpException(
      'Internal error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    filter.catch(exception, mockHost);

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        err: exception,
        path: '/test-path',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        requestId: 'test-request-id',
      }),
      'Server error occurred',
    );
  });

  it('should log client errors with warn level', () => {
    const exception = new BadRequestException('Bad request');

    filter.catch(exception, mockHost);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/test-path',
        statusCode: HttpStatus.BAD_REQUEST,
        requestId: 'test-request-id',
      }),
      'Client error occurred',
    );
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  it('should handle HttpException with string response', () => {
    const exception = new HttpException(
      'Simple string message',
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Simple string message',
      }),
    );
  });

  it('should handle HttpException with object response but no message field', () => {
    const exception = new HttpException(
      { error: 'Custom Error', statusCode: 400 },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.any(String) as string,
      }),
    );
  });

  it('should handle HttpException with object response but no error field', () => {
    const exception = new HttpException(
      { message: 'Validation error' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation error',
        error: 'HttpException',
      }),
    );
  });

  it('should not log for status codes between 200 and 399', () => {
    const exception = new HttpException(
      'Redirect',
      HttpStatus.MOVED_PERMANENTLY,
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.MOVED_PERMANENTLY);
    expect(mockLogger.error).not.toHaveBeenCalled();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });
});
