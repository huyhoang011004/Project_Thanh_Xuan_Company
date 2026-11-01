import { apiClient } from '@/lib/api-client';
import { CategoryItem, CategoryPayload } from './categories.types';

export const categoriesService = {
  getList: async (type?: string): Promise<CategoryItem[]> => {
    const params = type ? { type } : undefined;
    const res = await apiClient.get<CategoryItem[]>('/categories', { params });
    return res.data;
  },

  create: async (payload: CategoryPayload): Promise<CategoryItem> => {
    const res = await apiClient.post<CategoryItem>('/categories', payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<CategoryPayload>): Promise<CategoryItem> => {
    const res = await apiClient.put<CategoryItem>(`/categories/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
