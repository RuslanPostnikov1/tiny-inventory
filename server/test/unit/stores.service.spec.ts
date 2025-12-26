import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StoresService } from '../../src/stores/stores.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('StoresService', () => {
  let service: StoresService;

  const mockPrismaService = {
    store: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new store', async () => {
      const createStoreDto = {
        name: 'Test Store',
        address: '123 Test St',
      };

      const expectedStore = {
        id: '1',
        ...createStoreDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.store.create.mockResolvedValue(expectedStore);

      const result = await service.create(createStoreDto);

      expect(result).toEqual(expectedStore);
      expect(mockPrismaService.store.create).toHaveBeenCalledWith({
        data: createStoreDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated stores', async () => {
      const stores = [
        {
          id: '1',
          name: 'Store 1',
          address: 'Address 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { products: 5 },
        },
      ];

      mockPrismaService.store.findMany.mockResolvedValue(stores);
      mockPrismaService.store.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: stores,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should use default values when page and limit are not provided', async () => {
      const stores = [
        {
          id: '1',
          name: 'Store 1',
          address: 'Address 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { products: 5 },
        },
      ];

      mockPrismaService.store.findMany.mockResolvedValue(stores);
      mockPrismaService.store.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: stores,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a store by id', async () => {
      const store = {
        id: '1',
        name: 'Test Store',
        address: 'Test Address',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 3 },
      };

      mockPrismaService.store.findUnique.mockResolvedValue(store);

      const result = await service.findOne('1');

      expect(result).toEqual(store);
    });

    it('should throw NotFoundException if store not found', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a store', async () => {
      const store = {
        id: '1',
        name: 'Test Store',
        address: 'Test Address',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 0 },
      };

      const updateStoreDto = { name: 'Updated Store' };
      const updatedStore = { ...store, name: 'Updated Store' };

      mockPrismaService.store.update.mockResolvedValue(updatedStore);

      const result = await service.update('1', updateStoreDto);

      expect(result).toEqual(updatedStore);
      expect(mockPrismaService.store.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateStoreDto,
      });
    });

    it('should throw NotFoundException if store not found (P2025)', async () => {
      const prismaError = { code: 'P2025' };
      mockPrismaService.store.update.mockRejectedValue(prismaError);

      await expect(service.update('999', { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should rethrow non-P2025 errors', async () => {
      const genericError = new Error('Database connection failed');
      mockPrismaService.store.update.mockRejectedValue(genericError);

      await expect(service.update('1', { name: 'New Name' })).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('remove', () => {
    it('should delete a store with transaction', async () => {
      const store = {
        id: '1',
        name: 'Test Store',
        address: 'Test Address',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 0 },
      };

      // Mock the transaction
      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: unknown) => Promise<typeof store>) => {
          const tx = {
            product: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
            store: { delete: jest.fn().mockResolvedValue(store) },
          };
          return callback(tx);
        },
      );

      const result = await service.remove('1');

      expect(result).toEqual(store);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if store not found (P2025)', async () => {
      const prismaError = { code: 'P2025' };
      mockPrismaService.$transaction.mockRejectedValue(prismaError);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });

    it('should rethrow non-P2025 errors', async () => {
      const genericError = new Error('Transaction failed');
      mockPrismaService.$transaction.mockRejectedValue(genericError);

      await expect(service.remove('1')).rejects.toThrow('Transaction failed');
    });
  });

  describe('getStats', () => {
    it('should return store statistics using aggregations and raw queries', async () => {
      const store = {
        id: '1',
        name: 'Test Store',
        address: 'Test Address',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 2 },
      };

      mockPrismaService.store.findUnique.mockResolvedValue(store);
      mockPrismaService.product.aggregate.mockResolvedValue({
        _count: { id: 2 },
      });
      mockPrismaService.product.groupBy.mockResolvedValue([
        { category: 'Electronics', _count: { id: 2 }, _sum: { quantity: 15 } },
      ]);
      mockPrismaService.product.count.mockResolvedValue(1);
      // Mock $queryRaw calls - first for total inventory, second for category values
      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([{ total: '1250.00' }])
        .mockResolvedValueOnce([
          { category: 'Electronics', total_value: '1250.00' },
        ]);

      const result = await service.getStats('1');

      expect(result).toEqual({
        storeId: '1',
        totalProducts: 2,
        totalInventoryValue: 1250,
        categorySummary: [
          {
            category: 'Electronics',
            count: 2,
            totalValue: 1250,
          },
        ],
        lowStockCount: 1,
      });
    });

    it('should return empty stats for store with no products', async () => {
      const store = {
        id: '1',
        name: 'Test Store',
        address: 'Test Address',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 0 },
      };

      mockPrismaService.store.findUnique.mockResolvedValue(store);
      mockPrismaService.product.aggregate.mockResolvedValue({
        _count: { id: 0 },
      });
      mockPrismaService.product.groupBy.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([{ total: '0' }])
        .mockResolvedValueOnce([]);

      const result = await service.getStats('1');

      expect(result).toEqual({
        storeId: '1',
        totalProducts: 0,
        totalInventoryValue: 0,
        categorySummary: [],
        lowStockCount: 0,
      });
    });

    it('should throw NotFoundException if store not found', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.getStats('999')).rejects.toThrow(NotFoundException);
    });

    it('should correctly calculate category values with multiple categories', async () => {
      const store = {
        id: '1',
        name: 'Test Store',
        address: 'Test Address',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 3 },
      };

      mockPrismaService.store.findUnique.mockResolvedValue(store);
      mockPrismaService.product.aggregate.mockResolvedValue({
        _count: { id: 3 },
      });
      mockPrismaService.product.groupBy.mockResolvedValue([
        { category: 'Electronics', _count: { id: 2 }, _sum: { quantity: 14 } },
        { category: 'Books', _count: { id: 1 }, _sum: { quantity: 5 } },
      ]);
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([{ total: '1350.00' }])
        .mockResolvedValueOnce([
          { category: 'Electronics', total_value: '1100.00' },
          { category: 'Books', total_value: '250.00' },
        ]);

      const result = await service.getStats('1');

      expect(result).toEqual({
        storeId: '1',
        totalProducts: 3,
        totalInventoryValue: 1350,
        categorySummary: [
          { category: 'Electronics', count: 2, totalValue: 1100 },
          { category: 'Books', count: 1, totalValue: 250 },
        ],
        lowStockCount: 0,
      });
    });

    it('should handle category with 0 value in categoryValueMap (fallback to 0)', async () => {
      const store = {
        id: '1',
        name: 'Test Store',
        address: 'Test Address',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 1 },
      };

      mockPrismaService.store.findUnique.mockResolvedValue(store);
      mockPrismaService.product.aggregate.mockResolvedValue({
        _count: { id: 1 },
      });
      mockPrismaService.product.groupBy.mockResolvedValue([
        { category: 'Unknown', _count: { id: 1 }, _sum: { quantity: 0 } },
      ]);
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([{ total: '0' }])
        .mockResolvedValueOnce([]);

      const result = await service.getStats('1');

      expect(result.categorySummary).toEqual([
        { category: 'Unknown', count: 1, totalValue: 0 },
      ]);
    });

    it('should handle null total from raw query', async () => {
      const store = {
        id: '1',
        name: 'Test Store',
        address: 'Test Address',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 0 },
      };

      mockPrismaService.store.findUnique.mockResolvedValue(store);
      mockPrismaService.product.aggregate.mockResolvedValue({
        _count: { id: 0 },
      });
      mockPrismaService.product.groupBy.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([{ total: null }])
        .mockResolvedValueOnce([]);

      const result = await service.getStats('1');

      expect(result.totalInventoryValue).toBe(0);
    });
  });
});
