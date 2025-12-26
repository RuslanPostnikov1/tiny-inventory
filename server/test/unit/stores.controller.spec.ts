import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from '../../src/stores/stores.controller';
import { StoresService } from '../../src/stores/stores.service';

describe('StoresController', () => {
  let controller: StoresController;

  const mockStoresService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        {
          provide: StoresService,
          useValue: mockStoresService,
        },
      ],
    }).compile();

    controller = module.get<StoresController>(StoresController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a store', async () => {
      const createDto = { name: 'Test Store', address: '123 Test St' };
      const expected = { id: '1', ...createDto };

      mockStoresService.create.mockResolvedValue(expected);

      const result = await controller.create(createDto);

      expect(result).toEqual(expected);
      expect(mockStoresService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated stores', async () => {
      const query = { page: 1, limit: 10 };
      const expected = {
        data: [{ id: '1', name: 'Store 1' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      mockStoresService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(result).toEqual(expected);
      expect(mockStoresService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a store by id', async () => {
      const expected = { id: '1', name: 'Test Store' };

      mockStoresService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne('1');

      expect(result).toEqual(expected);
      expect(mockStoresService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a store', async () => {
      const updateDto = { name: 'Updated Store' };
      const expected = { id: '1', name: 'Updated Store' };

      mockStoresService.update.mockResolvedValue(expected);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(expected);
      expect(mockStoresService.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a store', async () => {
      const expected = { id: '1', name: 'Deleted Store' };

      mockStoresService.remove.mockResolvedValue(expected);

      const result = await controller.remove('1');

      expect(result).toEqual(expected);
      expect(mockStoresService.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getStats', () => {
    it('should return store statistics', async () => {
      const expected = {
        storeId: '1',
        totalProducts: 10,
        totalInventoryValue: 1000,
        categorySummary: [],
        lowStockCount: 2,
      };

      mockStoresService.getStats.mockResolvedValue(expected);

      const result = await controller.getStats('1');

      expect(result).toEqual(expected);
      expect(mockStoresService.getStats).toHaveBeenCalledWith('1');
    });
  });
});
