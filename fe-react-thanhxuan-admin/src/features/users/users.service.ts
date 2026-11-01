import { apiClient } from '@/lib/api-client';
import { UserAccount, UserAccountPayload } from './users.types';

export const usersService = {
  getList: async (): Promise<UserAccount[]> => {
    const res = await apiClient.get<UserAccount[] | { data: UserAccount[] }>('/users');
    const data = res.data;
    return Array.isArray(data) ? data : data.data || [];
  },

  create: async (payload: UserAccountPayload): Promise<UserAccount> => {
    const res = await apiClient.post<UserAccount>('/users', payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<UserAccountPayload>): Promise<UserAccount> => {
    const res = await apiClient.put<UserAccount>(`/users/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
