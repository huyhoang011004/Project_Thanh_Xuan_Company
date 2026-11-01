import { apiClient } from '@/lib/api-client';
import { ArticleItem, ArticlePayload } from './articles.types';

export const articlesService = {
  getList: async (params?: { search?: string; categoryId?: string; isDeleted?: boolean }): Promise<ArticleItem[]> => {
    const res = await apiClient.get<ArticleItem[] | { data: ArticleItem[] }>('/articles', { params });
    const data = res.data;
    return Array.isArray(data) ? data : data.data || [];
  },

  getById: async (id: string): Promise<ArticleItem> => {
    const res = await apiClient.get<ArticleItem>(`/articles/${id}`);
    return res.data;
  },

  create: async (payload: ArticlePayload): Promise<ArticleItem> => {
    const res = await apiClient.post<ArticleItem>('/articles', payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<ArticlePayload>): Promise<ArticleItem> => {
    const res = await apiClient.put<ArticleItem>(`/articles/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/articles/${id}`);
  },

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ url: string }>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
