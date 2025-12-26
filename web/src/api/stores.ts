import { apiClient } from './client';
import type {
  Store,
  StoreStats,
  PaginatedResponse,
  CreateStoreDto,
  UpdateStoreDto,
} from '../types';

export const storesApi = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Store>> => {
    const response = await apiClient.get('/stores', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Store> => {
    const response = await apiClient.get(`/stores/${id}`);
    return response.data;
  },

  getStats: async (id: string): Promise<StoreStats> => {
    const response = await apiClient.get(`/stores/${id}/stats`);
    return response.data;
  },

  create: async (data: CreateStoreDto): Promise<Store> => {
    const response = await apiClient.post('/stores', data);
    return response.data;
  },

  update: async (id: string, data: UpdateStoreDto): Promise<Store> => {
    const response = await apiClient.patch(`/stores/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/stores/${id}`);
  },
};

