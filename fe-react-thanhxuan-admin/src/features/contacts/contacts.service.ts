import { apiClient } from '@/lib/api-client';
import { ContactItem, ContactStatus } from './contacts.types';

export const contactsService = {
  getList: async (params?: { search?: string; status?: string }): Promise<ContactItem[]> => {
    const res = await apiClient.get<ContactItem[] | { data: ContactItem[] }>('/contacts', { params });
    const data = res.data;
    return Array.isArray(data) ? data : data.data || [];
  },

  updateStatus: async (id: string, status: ContactStatus, note?: string): Promise<ContactItem> => {
    const res = await apiClient.patch<ContactItem>(`/contacts/${id}/status`, { status, note });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/contacts/${id}`);
  },
};
