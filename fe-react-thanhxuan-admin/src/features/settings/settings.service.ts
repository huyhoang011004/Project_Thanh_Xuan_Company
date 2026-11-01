import { apiClient } from '@/lib/api-client';
import { WebsiteSettings } from './settings.types';

export const settingsService = {
  getSettings: async (): Promise<WebsiteSettings> => {
    const res = await apiClient.get<WebsiteSettings>('/settings');
    return res.data;
  },

  updateSettings: async (payload: Partial<WebsiteSettings>): Promise<WebsiteSettings> => {
    const res = await apiClient.put<WebsiteSettings>('/settings', payload);
    return res.data;
  },
};
