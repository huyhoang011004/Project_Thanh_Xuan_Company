// Adhering to SOLID & Design Patterns
import { apiClient } from "@/services/api.service";
import { CrmCustomer } from "./admin-crm.types";

export const AdminCrmService = {
  getCustomers: async (
    search: string,
    tagFilter: string,
    zaloFilter: string,
    emailFilter: string
  ): Promise<CrmCustomer[]> => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (tagFilter) queryParams.append("tag", tagFilter);
    if (zaloFilter) queryParams.append("isZaloFollower", zaloFilter);
    if (emailFilter) queryParams.append("isEmailSubscriber", emailFilter);

    const data = await apiClient.get(`/crm/customers?${queryParams.toString()}`, true, {
      cache: "no-store",
    });
    return Array.isArray(data) ? data : [];
  },
};
