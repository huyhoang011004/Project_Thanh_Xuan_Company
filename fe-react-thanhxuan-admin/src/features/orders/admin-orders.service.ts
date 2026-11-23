// Adhering to SOLID & Design Patterns
import { apiClient } from "@/services/api.service";
import { Order, OrderFormData, CategoryNode } from "./admin-orders.types";

export const AdminOrdersService = {
  getOrders: async (search: string, statusFilter: string): Promise<Order[]> => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (statusFilter) queryParams.append("status", statusFilter);

    const data = await apiClient.get(`/orders?${queryParams.toString()}`, true, {
      cache: "no-store",
    });
    return Array.isArray(data) ? data : [];
  },

  createOrder: async (data: OrderFormData): Promise<Order> => {
    return await apiClient.post("/orders", data, true);
  },

  updateOrderStatus: async (id: string, status: string): Promise<void> => {
    await apiClient.put(`/orders/${id}`, { status }, true);
  },

  sendZns: async (order: Order): Promise<void> => {
    await apiClient.post(
      "/zalo/zns/send",
      {
        phoneNumber: order.phoneNumber,
        templateId: "TEMPLATE_ORDER_CONFIRMATION",
        templateData: {
          customer_name: order.customerName,
          order_code: order.orderCode,
          total_amount: `${order.totalAmount?.toLocaleString("vi-VN")} đ`,
          status: order.status,
        },
      },
      true
    );
  },

  getServiceCategories: async (): Promise<CategoryNode[]> => {
    const res: any = await apiClient.get("/categories/tree?type=SERVICE");
    return Array.isArray(res) ? res : res.data || [];
  },
};
