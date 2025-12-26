import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from '../../src/products/products.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    store: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto = {
        name: 'Test Product',
        category: 'Electronics',
        price: 99.99,
        quantity: 10,
        storeId: '1',
      };

      const store = { id: '1', name: 'Test Store', address: 'Test Address' };
      const expectedProduct = {
        id: '1',
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        store,
      };

      mockPrismaService.store.findUnique.mockResolvedValue(store);
      mockPrismaService.product.create.mockResolvedValue(expectedProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(expectedProduct);
      expect(mockPrismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw BadRequestException if store does not exist', async () => {
      const createProductDto = {
        name: 'Test Product',
        category: 'Electronics',
        price: 99.99,
        quantity: 10,
        storeId: '999',
      };

      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated products with filters', async () => {
      const products = [
        {
          id: '1',
          name: 'Product 1',
          category: 'Electronics',
          price: 100,
          quantity: 10,
          storeId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          store: { id: '1', name: 'Store 1' },
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(products);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        category: 'Electronics',
      });

      expect(result.data).toEqual(products);
      expect(result.meta.total).toBe(1);
      expect(result.meta.filters.category).toBe('Electronics');
    });

    it('should use default values when page and limit are not provided', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should filter by price range', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        minPrice: 50,
        maxPrice: 150,
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            price: { gte: 50, lte: 150 },
          }),
        }),
      );
    });

    it('should filter by stock level', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        minStock: 5,
        maxStock: 20,
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            quantity: { gte: 5, lte: 20 },
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should filter by storeId', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        storeId: 'store-1',
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            storeId: 'store-1',
          }),
        }),
      );
    });

    it('should filter by minPrice only', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        minPrice: 50,
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            price: { gte: 50 },
          }),
        }),
      );
    });

    it('should filter by maxPrice only', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        maxPrice: 150,
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            price: { lte: 150 },
          }),
        }),
      );
    });

    it('should filter by minStock only', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        minStock: 5,
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            quantity: { gte: 5 },
          }),
        }),
      );
    });

    it('should filter by maxStock only', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        maxStock: 20,
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            quantity: { lte: 20 },
          }),
        }),
      );
    });

    it('should apply sorting by name ascending', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          orderBy: { name: 'asc' },
        }),
      );
    });

    it('should apply sorting by price descending', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'price',
        sortOrder: 'desc',
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          orderBy: { price: 'desc' },
        }),
      );
    });

    it('should use default sorting (createdAt desc) when not specified', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should return sorting info in meta', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'quantity',
        sortOrder: 'asc',
      });

      expect(result.meta.sorting).toEqual({
        sortBy: 'quantity',
        sortOrder: 'asc',
      });
    });

    it('should filter by search (name contains, case-insensitive)', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        search: 'iPhone',
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            name: { contains: 'iPhone', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should filter by stockStatus out_of_stock', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        stockStatus: 'out_of_stock',
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            quantity: { equals: 0 },
          }),
        }),
      );
    });

    it('should filter by stockStatus low_stock', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        stockStatus: 'low_stock',
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            quantity: { gt: 0, lt: 10 },
          }),
        }),
      );
    });

    it('should filter by stockStatus in_stock', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        stockStatus: 'in_stock',
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            quantity: { gte: 10 },
          }),
        }),
      );
    });

    it('should return search and stockStatus in meta filters', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        search: 'test',
        stockStatus: 'in_stock',
      });

      expect(result.meta.filters).toEqual(
        expect.objectContaining({
          search: 'test',
          stockStatus: 'in_stock',
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = {
        id: '1',
        name: 'Test Product',
        category: 'Electronics',
        price: 99.99,
        quantity: 10,
        storeId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        store: { id: '1', name: 'Store 1', address: 'Address 1' },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(product);

      const result = await service.findOne('1');

      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const product = {
        id: '1',
        name: 'Test Product',
        category: 'Electronics',
        price: 99.99,
        quantity: 10,
        storeId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        store: { id: '1', name: 'Store 1', address: 'Address 1' },
      };

      const updateDto = { quantity: 20 };
      const updatedProduct = { ...product, quantity: 20 };

      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
        include: { store: true },
      });
    });

    it('should throw NotFoundException if product not found (P2025)', async () => {
      const prismaError = { code: 'P2025' };
      mockPrismaService.product.update.mockRejectedValue(prismaError);

      await expect(service.update('999', { quantity: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should rethrow non-P2025 errors', async () => {
      const genericError = new Error('Database error');
      mockPrismaService.product.update.mockRejectedValue(genericError);

      await expect(service.update('1', { quantity: 10 })).rejects.toThrow(
        'Database error',
      );
    });

    it('should throw BadRequestException if new storeId does not exist', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(
        service.update('1', { storeId: 'invalid-store' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update product with new storeId if store exists', async () => {
      const product = {
        id: '1',
        name: 'Test Product',
        category: 'Electronics',
        price: 99.99,
        quantity: 10,
        storeId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        store: { id: '1', name: 'Store 1', address: 'Address 1' },
      };

      const newStore = { id: '2', name: 'Store 2', address: 'Address 2' };
      const updateDto = { storeId: '2' };
      const updatedProduct = { ...product, storeId: '2', store: newStore };

      mockPrismaService.store.findUnique.mockResolvedValue(newStore);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedProduct);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const product = {
        id: '1',
        name: 'Test Product',
        category: 'Electronics',
        price: 99.99,
        quantity: 10,
        storeId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        store: { id: '1', name: 'Store 1', address: 'Address 1' },
      };

      mockPrismaService.product.delete.mockResolvedValue(product);

      const result = await service.remove('1');

      expect(result).toEqual(product);
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if product not found (P2025)', async () => {
      const prismaError = { code: 'P2025' };
      mockPrismaService.product.delete.mockRejectedValue(prismaError);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });

    it('should rethrow non-P2025 errors', async () => {
      const genericError = new Error('Delete failed');
      mockPrismaService.product.delete.mockRejectedValue(genericError);

      await expect(service.remove('1')).rejects.toThrow('Delete failed');
    });
  });
});
