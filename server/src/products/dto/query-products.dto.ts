import {
  IsOptional,
  IsInt,
  IsNumber,
  IsString,
  IsUUID,
  IsIn,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../../common/constants';
import { IsGreaterThanOrEqual } from '../../common/validators/is-greater-than-or-equal.validator';

const SORT_FIELDS = [
  'name',
  'category',
  'price',
  'quantity',
  'createdAt',
] as const;
const SORT_ORDERS = ['asc', 'desc'] as const;
const STOCK_STATUSES = ['in_stock', 'low_stock', 'out_of_stock'] as const;

export class QueryProductsDto {
  @ApiPropertyOptional({
    description: 'Page number',
    default: DEFAULT_PAGE,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: DEFAULT_LIMIT,
    minimum: 1,
    maximum: MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = DEFAULT_LIMIT;

  @ApiPropertyOptional({
    description: 'Search by product name (case-insensitive)',
    example: 'iPhone',
    maxLength: 200,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by store ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by stock status',
    example: 'in_stock',
    enum: STOCK_STATUSES,
  })
  @IsOptional()
  @IsString()
  @IsIn(STOCK_STATUSES)
  stockStatus?: (typeof STOCK_STATUSES)[number];

  @ApiPropertyOptional({
    description: 'Filter by category',
    example: 'Electronics',
    maxLength: 100,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter (must be >= minPrice)',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsGreaterThanOrEqual('minPrice', {
    message: 'maxPrice must be greater than or equal to minPrice',
  })
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Minimum stock level filter',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({
    description: 'Maximum stock level filter (must be >= minStock)',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsGreaterThanOrEqual('minStock', {
    message: 'maxStock must be greater than or equal to minStock',
  })
  maxStock?: number;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'name',
    enum: SORT_FIELDS,
  })
  @IsOptional()
  @IsString()
  @IsIn(SORT_FIELDS)
  sortBy?: (typeof SORT_FIELDS)[number] = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'asc',
    enum: SORT_ORDERS,
  })
  @IsOptional()
  @IsString()
  @IsIn(SORT_ORDERS)
  sortOrder?: (typeof SORT_ORDERS)[number] = 'desc';
}
