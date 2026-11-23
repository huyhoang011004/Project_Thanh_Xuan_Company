// Adhering to SOLID & Design Patterns
"use client";


import { Plus, ShoppingCart } from "lucide-react";
import { useAdminOrders } from "./useAdminOrders";
import { OrdersManagerToolbarComponent, OrdersManagerTableComponent } from "./components";
import { OrdersManagerModal } from "./modals/OrdersManagerModal";

export function OrdersManagerPage() {
  const {
    orders,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isModalOpen,
    setIsModalOpen,
    serviceCategories,
    fetchOrders,
    handleUpdateStatus,
    handleSendZns,
  } = useAdminOrders();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-blue-600" /> Quản lý Đơn hàng Giặt sấy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tạo mới đơn hàng, theo dõi trạng thái và tự động gửi thông báo ZNS Zalo
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/20 hover:opacity-95 transition"
        >
          <Plus className="w-5 h-5" /> Tạo đơn hàng mới
        </button>
      </div>

      <OrdersManagerToolbarComponent
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onRefresh={fetchOrders}
        onOpenModal={() => setIsModalOpen(true)}
      />

      <OrdersManagerTableComponent
        orders={orders}
        loading={loading}
        onUpdateStatus={handleUpdateStatus}
        onSendZns={handleSendZns}
      />

      <OrdersManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceCategories={serviceCategories}
        onSuccess={fetchOrders}
      />
    </div>
  );
}

export { OrdersManagerPage as OrdersListPage };
