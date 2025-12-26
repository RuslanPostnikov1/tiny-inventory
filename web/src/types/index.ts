export interface Store {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  store?: {
    id: string;
    name: string;
  };
}

export interface StoreStats {
  storeId: string;
  totalProducts: number;
  totalInventoryValue: number;
  categorySummary: {
    category: string;
    count: number;
    totalValue: number;
  }[];
  lowStockCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters?: Record<string, unknown>;
  };
}

export interface CreateStoreDto {
  name: string;
  address: string;
}

export interface UpdateStoreDto {
  name?: string;
  address?: string;
}

export interface CreateProductDto {
  name: string;
  category: string;
  price: number;
  quantity: number;
  storeId: string;
}

export interface UpdateProductDto {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  storeId?: string;
}

export type SortField = 'name' | 'category' | 'price' | 'quantity' | 'createdAt';
export type SortOrder = 'asc' | 'desc';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  storeId?: string;
  stockStatus?: StockStatus;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}
