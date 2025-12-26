import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import {
  createPaginationMeta,
  calculateSkip,
} from '../common/utils/pagination.util';
import { LOW_STOCK_THRESHOLD } from '../common/constants';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates that a store exists, throws BadRequestException if not
   */
  private async validateStoreExists(storeId: string): Promise<void> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new BadRequestException(`Store with ID ${storeId} not found`);
    }
  }

  async create(createProductDto: CreateProductDto) {
    await this.validateStoreExists(createProductDto.storeId);

    return this.prisma.product.create({
      data: createProductDto,
      include: {
        store: true,
      },
    });
  }

  async findAll(query: QueryProductsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      storeId,
      stockStatus,
      category,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = calculateSkip(page, limit);
    const where = this.buildWhereClause({
      search,
      storeId,
      stockStatus,
      category,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
    });

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        ...createPaginationMeta(total, page, limit),
        filters: {
          search,
          storeId,
          stockStatus,
          category,
          minPrice,
          maxPrice,
          minStock,
          maxStock,
        },
        sorting: {
          sortBy,
          sortOrder,
        },
      },
    };
  }

  /**
   * Builds Prisma where clause for filtering products
   */
  private buildWhereClause(filters: {
    search?: string;
    storeId?: string;
    stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    maxStock?: number;
  }): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    // Search by name (case-insensitive)
    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters.storeId) {
      where.storeId = filters.storeId;
    }

    // Stock status filter
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'out_of_stock':
          where.quantity = { equals: 0 };
          break;
        case 'low_stock':
          where.quantity = { gt: 0, lt: LOW_STOCK_THRESHOLD };
          break;
        case 'in_stock':
          where.quantity = { gte: LOW_STOCK_THRESHOLD };
          break;
      }
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    // Only apply minStock/maxStock if stockStatus is not set
    if (
      !filters.stockStatus &&
      (filters.minStock !== undefined || filters.maxStock !== undefined)
    ) {
      where.quantity = {};
      if (filters.minStock !== undefined) {
        where.quantity.gte = filters.minStock;
      }
      if (filters.maxStock !== undefined) {
        where.quantity.lte = filters.maxStock;
      }
    }

    return where;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (updateProductDto.storeId) {
      await this.validateStoreExists(updateProductDto.storeId);
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: {
          store: true,
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }
}
