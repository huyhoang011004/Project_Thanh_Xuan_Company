import { apiClient as rawClient } from '@/lib/api-client';

export const apiClient = {
  get: async <T = unknown>(url: string, _auth = true, _opts?: Record<string, unknown>): Promise<T> => {
    const res = await rawClient.get<T>(url);
    return res.data;
  },
  post: async <T = unknown>(url: string, body: unknown = {}, _auth = true): Promise<T> => {
    const res = await rawClient.post<T>(url, body);
    return res.data;
  },
  put: async <T = unknown>(url: string, body: unknown = {}, _auth = true): Promise<T> => {
    const res = await rawClient.put<T>(url, body);
    return res.data;
  },
  patch: async <T = unknown>(url: string, body: unknown = {}, _auth = true): Promise<T> => {
    const res = await rawClient.patch<T>(url, body);
    return res.data;
  },
  delete: async <T = unknown>(url: string, _auth = true): Promise<T> => {
    const res = await rawClient.delete<T>(url);
    return res.data;
  },
};
