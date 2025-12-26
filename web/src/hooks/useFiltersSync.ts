import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProductFilters, SortField, SortOrder, StockStatus } from '../types';

/**
 * Hook to sync product filters with URL search params
 * Allows sharing filtered views via URL
 */
export function useFiltersSync() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filters: ProductFilters = useMemo(() => {
    const result: ProductFilters = {};

    const search = searchParams.get('search');
    if (search) result.search = search;

    const category = searchParams.get('category');
    if (category) result.category = category;

    const stockStatus = searchParams.get('stockStatus');
    if (stockStatus && ['in_stock', 'low_stock', 'out_of_stock'].includes(stockStatus)) {
      result.stockStatus = stockStatus as StockStatus;
    }

    const minPrice = searchParams.get('minPrice');
    if (minPrice && !isNaN(Number(minPrice))) {
      result.minPrice = Number(minPrice);
    }

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice && !isNaN(Number(maxPrice))) {
      result.maxPrice = Number(maxPrice);
    }

    const sortBy = searchParams.get('sortBy');
    if (sortBy && ['name', 'category', 'price', 'quantity', 'createdAt'].includes(sortBy)) {
      result.sortBy = sortBy as SortField;
    }

    const sortOrder = searchParams.get('sortOrder');
    if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
      result.sortOrder = sortOrder as SortOrder;
    }

    return result;
  }, [searchParams]);

  // Get current page from URL
  const page = useMemo(() => {
    const pageParam = searchParams.get('page');
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [searchParams]);

  // Update filters in URL
  const setFilters = useCallback(
    (newFilters: ProductFilters) => {
      setSearchParams(() => {
        const next = new URLSearchParams();

        if (newFilters.search) next.set('search', newFilters.search);
        if (newFilters.category) next.set('category', newFilters.category);
        if (newFilters.stockStatus) next.set('stockStatus', newFilters.stockStatus);
        if (newFilters.minPrice !== undefined) next.set('minPrice', String(newFilters.minPrice));
        if (newFilters.maxPrice !== undefined) next.set('maxPrice', String(newFilters.maxPrice));
        if (newFilters.sortBy) next.set('sortBy', newFilters.sortBy);
        if (newFilters.sortOrder) next.set('sortOrder', newFilters.sortOrder);

        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  // Update page in URL
  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newPage === 1) {
          next.delete('page');
        } else {
          next.set('page', String(newPage));
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  return {
    filters,
    page,
    setFilters,
    setPage,
  };
}
