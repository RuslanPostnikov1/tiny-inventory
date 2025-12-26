import { ApiProperty } from '@nestjs/swagger';

export class StoreResponseDto {
  @ApiProperty({
    description: 'Store UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({ description: 'Store name', example: 'Downtown Electronics' })
  name: string;

  @ApiProperty({
    description: 'Store address',
    example: '123 Main St, New York, NY 10001',
  })
  address: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class StoreWithCountResponseDto extends StoreResponseDto {
  @ApiProperty({ description: 'Product count', example: { products: 10 } })
  _count: { products: number };
}

class CategorySummaryDto {
  @ApiProperty({ description: 'Category name', example: 'Electronics' })
  category: string;

  @ApiProperty({ description: 'Number of products in category', example: 5 })
  count: number;

  @ApiProperty({
    description: 'Total value of products in category',
    example: 4999.95,
  })
  totalValue: number;
}

export class StoreStatsResponseDto {
  @ApiProperty({ description: 'Store UUID' })
  storeId: string;

  @ApiProperty({ description: 'Total number of products', example: 25 })
  totalProducts: number;

  @ApiProperty({ description: 'Total inventory value', example: 12499.75 })
  totalInventoryValue: number;

  @ApiProperty({
    description: 'Summary by category',
    type: [CategorySummaryDto],
  })
  categorySummary: CategorySummaryDto[];

  @ApiProperty({ description: 'Number of low stock products', example: 3 })
  lowStockCount: number;
}

class PaginationMetaDto {
  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;
}

export class PaginatedStoresResponseDto {
  @ApiProperty({
    description: 'List of stores',
    type: [StoreWithCountResponseDto],
  })
  data: StoreWithCountResponseDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
