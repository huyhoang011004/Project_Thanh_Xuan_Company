import { apiClient } from "@/services/api.service";
import type { IAdminSettingsForm } from "./admin-settings.types";

export const SettingsService = {
  getSettings: async (): Promise<IAdminSettingsForm> => {
    return await apiClient.get<IAdminSettingsForm>("/settings", false, {
      cache: "no-store",
    });
  },

  updateSettings: async (data: Partial<IAdminSettingsForm>) => {
    return await apiClient.put("/settings", data, true);
  },
};
