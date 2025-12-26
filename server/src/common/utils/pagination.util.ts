import { PaginationMeta } from '../interfaces/pagination.interface';

/**
 * Creates pagination metadata for paginated responses
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Calculates skip value for pagination
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
