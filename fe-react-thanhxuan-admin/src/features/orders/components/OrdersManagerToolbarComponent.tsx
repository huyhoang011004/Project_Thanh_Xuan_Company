// Adhering to SOLID & Design Patterns
import { Search, RefreshCw } from "lucide-react";

interface OrdersManagerToolbarComponentProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onRefresh: () => void;
  onOpenModal?: () => void;
}

export function OrdersManagerToolbarComponent({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onRefresh,
}: OrdersManagerToolbarComponentProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo Mã đơn, Tên hoặc SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full md:w-48 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="pending">Mới tiếp nhận</option>
        <option value="processing">Đang giặt sấy</option>
        <option value="completed">Đã hoàn thành</option>
        <option value="cancelled">Đã hủy</option>
      </select>
      <button
        onClick={onRefresh}
        className="p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
      >
        <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}
