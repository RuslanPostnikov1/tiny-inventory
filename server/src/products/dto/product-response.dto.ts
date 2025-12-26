import { ApiProperty } from '@nestjs/swagger';

class StoreInfoDto {
  @ApiProperty({ description: 'Store UUID' })
  id: string;

  @ApiProperty({ description: 'Store name' })
  name: string;
}

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({ description: 'Product name', example: 'iPhone 15 Pro' })
  name: string;

  @ApiProperty({ description: 'Product category', example: 'Electronics' })
  category: string;

  @ApiProperty({ description: 'Product price', example: '999.99' })
  price: string;

  @ApiProperty({ description: 'Quantity in stock', example: 50 })
  quantity: number;

  @ApiProperty({ description: 'Store UUID' })
  storeId: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Store information',
    type: StoreInfoDto,
    required: false,
  })
  store?: StoreInfoDto;
}

class ProductFiltersDto {
  @ApiProperty({ required: false })
  storeId?: string;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty({ required: false })
  minPrice?: number;

  @ApiProperty({ required: false })
  maxPrice?: number;

  @ApiProperty({ required: false })
  minStock?: number;

  @ApiProperty({ required: false })
  maxStock?: number;
}

class ProductPaginationMetaDto {
  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Applied filters', type: ProductFiltersDto })
  filters: ProductFiltersDto;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ description: 'List of products', type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: ProductPaginationMetaDto,
  })
  meta: ProductPaginationMetaDto;
}
