// Adhering to SOLID & Design Patterns
import { Send } from "lucide-react";
import { Order } from "../admin-orders.types";

interface OrdersManagerTableComponentProps {
  orders: Order[];
  loading: boolean;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onSendZns: (order: Order) => void;
}

export function OrdersManagerTableComponent({
  orders,
  loading,
  onUpdateStatus,
  onSendZns,
}: OrdersManagerTableComponentProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-500 uppercase bg-gray-50/50 dark:bg-slate-800/50">
            <th className="p-4">Mã đơn</th>
            <th className="p-4">Khách hàng</th>
            <th className="p-4">Dịch vụ</th>
            <th className="p-4">Tổng tiền</th>
            <th className="p-4">Trạng thái đơn</th>
            <th className="p-4">ZNS Zalo</th>
            <th className="p-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
          {loading ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-500">
                Đang tải danh sách...
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-500">
                Chưa có đơn hàng nào
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order._id}
                className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition"
              >
                <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                  {order.orderCode}
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.phoneNumber}
                  </div>
                </td>
                <td className="p-4 capitalize">{order.serviceCategory}</td>
                <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                  {order.totalAmount?.toLocaleString("vi-VN")} đ
                </td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                    className="px-2.5 py-1 text-xs font-medium rounded-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="pending">Mới tiếp nhận</option>
                    <option value="processing">Đang giặt sấy</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <Send className="w-3 h-3" /> ZNS Ready
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => onSendZns(order)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                  >
                    Gửi ZNS
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
