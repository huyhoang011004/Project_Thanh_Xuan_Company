import { apiClient } from '@/lib/api-client';
import { ArticleItem, ArticlePayload } from './articles.types';
import { getStoredTenant } from '@/lib/tenant-storage';

interface RawMovingArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
  status?: string;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

function normalizeMovingArticle(m: RawMovingArticle): ArticleItem {
  return {
    _id: m._id,
    title: m.title,
    slug: m.slug,
    description: m.excerpt || '',
    content: m.content || '',
    thumbnail: m.thumbnail,
    isPublished: m.status === 'PUBLISHED',
    isPinned: false,
    views: m.viewCount || 0,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

export const articlesService = {
  getList: async (params?: { search?: string; categoryId?: string; isDeleted?: boolean }): Promise<ArticleItem[]> => {
    const tenant = getStoredTenant();
    if (tenant === 'moving') {
      const res = await apiClient.get<RawMovingArticle[] | { data: RawMovingArticle[] }>('/v1/moving/articles/admin/all');
      const data = res.data;
      const rawList = Array.isArray(data) ? data : (data as { data: RawMovingArticle[] })?.data || [];
      let list = rawList.map(normalizeMovingArticle);
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter((a) => a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q));
      }
      return list;
    }

    const res = await apiClient.get<ArticleItem[] | { data: ArticleItem[] }>('/articles', { params });
    const data = res.data;
    return Array.isArray(data) ? data : (data as { data: ArticleItem[] })?.data || [];
  },

  getById: async (id: string): Promise<ArticleItem> => {
    const tenant = getStoredTenant();
    if (tenant === 'moving') {
      const res = await apiClient.get<RawMovingArticle>(`/v1/moving/articles/${id}`);
      return normalizeMovingArticle(res.data);
    }
    const res = await apiClient.get<ArticleItem>(`/articles/${id}`);
    return res.data;
  },

  create: async (payload: ArticlePayload): Promise<ArticleItem> => {
    const tenant = getStoredTenant();
    if (tenant === 'moving') {
      const movingBody = {
        title: payload.title,
        slug: payload.slug,
        excerpt: payload.description || payload.title,
        content: payload.content,
        thumbnail: payload.thumbnail,
        seoTitle: payload.metaTitle,
        seoDescription: payload.metaDescription,
        status: payload.isPublished ? 'PUBLISHED' : 'DRAFT',
      };
      const res = await apiClient.post<RawMovingArticle>('/v1/moving/articles', movingBody);
      return normalizeMovingArticle(res.data);
    }

    const res = await apiClient.post<ArticleItem>('/articles', payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<ArticlePayload>): Promise<ArticleItem> => {
    const tenant = getStoredTenant();
    if (tenant === 'moving') {
      const movingBody: Record<string, unknown> = {};
      if (payload.title !== undefined) movingBody.title = payload.title;
      if (payload.slug !== undefined) movingBody.slug = payload.slug;
      if (payload.description !== undefined) movingBody.excerpt = payload.description;
      if (payload.content !== undefined) movingBody.content = payload.content;
      if (payload.thumbnail !== undefined) movingBody.thumbnail = payload.thumbnail;
      if (payload.metaTitle !== undefined) movingBody.seoTitle = payload.metaTitle;
      if (payload.metaDescription !== undefined) movingBody.seoDescription = payload.metaDescription;
      if (payload.isPublished !== undefined) movingBody.status = payload.isPublished ? 'PUBLISHED' : 'DRAFT';

      const res = await apiClient.patch<RawMovingArticle>(`/v1/moving/articles/${id}`, movingBody);
      return normalizeMovingArticle(res.data);
    }

    const res = await apiClient.put<ArticleItem>(`/articles/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    const tenant = getStoredTenant();
    if (tenant === 'moving') {
      await apiClient.delete(`/v1/moving/articles/${id}`);
      return;
    }
    await apiClient.delete(`/articles/${id}`);
  },

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ url: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
