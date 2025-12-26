import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../../src/products/products.controller';
import { ProductsService } from '../../src/products/products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto = {
        name: 'Test Product',
        category: 'Electronics',
        price: 99.99,
        quantity: 10,
        storeId: '1',
      };
      const expected = { id: '1', ...createDto };

      mockProductsService.create.mockResolvedValue(expected);

      const result = await controller.create(createDto);

      expect(result).toEqual(expected);
      expect(mockProductsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const query = { page: 1, limit: 10 };
      const expected = {
        data: [{ id: '1', name: 'Product 1' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      mockProductsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(result).toEqual(expected);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const expected = { id: '1', name: 'Test Product' };

      mockProductsService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne('1');

      expect(result).toEqual(expected);
      expect(mockProductsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { quantity: 20 };
      const expected = { id: '1', quantity: 20 };

      mockProductsService.update.mockResolvedValue(expected);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(expected);
      expect(mockProductsService.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const expected = { id: '1', name: 'Deleted Product' };

      mockProductsService.remove.mockResolvedValue(expected);

      const result = await controller.remove('1');

      expect(result).toEqual(expected);
      expect(mockProductsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
