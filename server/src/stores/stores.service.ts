import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { QueryStoresDto } from './dto/query-stores.dto';
import { LOW_STOCK_THRESHOLD } from '../common/constants';
import {
  createPaginationMeta,
  calculateSkip,
} from '../common/utils/pagination.util';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStoreDto: CreateStoreDto) {
    return this.prisma.store.create({
      data: createStoreDto,
    });
  }

  async findAll(query: QueryStoresDto) {
    const { page = 1, limit = 10 } = query;
    const skip = calculateSkip(page, limit);

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      this.prisma.store.count(),
    ]);

    return {
      data: stores,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    try {
      return await this.prisma.store.update({
        where: { id },
        data: updateStoreDto,
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundException(`Store with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Use transaction to ensure atomicity
      return await this.prisma.$transaction(async (tx) => {
        // Delete associated products first
        await tx.product.deleteMany({ where: { storeId: id } });
        // Then delete the store
        return tx.store.delete({ where: { id } });
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundException(`Store with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Non-trivial operation: Get store statistics with inventory calculations
   * Uses database aggregations for performance with large datasets
   */
  async getStats(id: string) {
    await this.findOne(id);

    // Use raw query for inventory value calculation to avoid loading all products into memory
    const [aggregation, categorySummary, lowStockCount, inventoryValueResult] =
      await Promise.all([
        // Get total products count
        this.prisma.product.aggregate({
          where: { storeId: id },
          _count: { id: true },
        }),

        // Get category breakdown with value using groupBy
        this.prisma.product.groupBy({
          by: ['category'],
          where: { storeId: id },
          _count: { id: true },
          _sum: { quantity: true },
        }),

        // Count low stock items
        this.prisma.product.count({
          where: {
            storeId: id,
            quantity: { lt: LOW_STOCK_THRESHOLD },
          },
        }),

        // Calculate total inventory value with raw SQL for memory efficiency
        this.prisma.$queryRaw<[{ total: string | null }]>`
        SELECT COALESCE(SUM(price * quantity), 0) as total 
        FROM "products" 
        WHERE "storeId" = ${id}
      `,
      ]);

    // Get category values with raw SQL
    const categoryValues = await this.prisma.$queryRaw<
      { category: string; total_value: string }[]
    >`
      SELECT category, COALESCE(SUM(price * quantity), 0) as total_value 
      FROM "products" 
      WHERE "storeId" = ${id}
      GROUP BY category
    `;

    const categoryValueMap = new Map<string, number>();
    for (const cv of categoryValues) {
      categoryValueMap.set(cv.category, parseFloat(cv.total_value));
    }

    const enrichedCategorySummary = categorySummary.map((cat) => ({
      category: cat.category,
      count: cat._count.id,
      totalValue: parseFloat(
        (categoryValueMap.get(cat.category) ?? 0).toFixed(2),
      ),
    }));

    const totalInventoryValue = parseFloat(
      inventoryValueResult[0]?.total ?? '0',
    );

    return {
      storeId: id,
      totalProducts: aggregation._count.id,
      totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
      categorySummary: enrichedCategorySummary,
      lowStockCount,
    };
  }
}
