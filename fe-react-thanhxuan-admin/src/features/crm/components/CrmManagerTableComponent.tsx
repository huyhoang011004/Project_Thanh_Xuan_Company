// Adhering to SOLID & Design Patterns
import { CheckCircle2, XCircle } from "lucide-react";
import { CrmCustomer } from "../admin-crm.types";

interface CrmManagerTableComponentProps {
  customers: CrmCustomer[];
  loading: boolean;
}

export function CrmManagerTableComponent({ customers, loading }: CrmManagerTableComponentProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-500 uppercase bg-gray-50/50 dark:bg-slate-800/50">
            <th className="p-4">Họ và tên</th>
            <th className="p-4">Liên hệ</th>
            <th className="p-4">Trạng thái (Zalo/Email)</th>
            <th className="p-4">Phân nhóm (Tags)</th>
            <th className="p-4">Số đơn giặt</th>
            <th className="p-4">Tổng chi tiêu</th>
            <th className="p-4 text-right">Ngày tạo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
          {loading ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-500">Đang tải dữ liệu khách hàng CRM...</td>
            </tr>
          ) : customers.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-500">Chưa có dữ liệu khách hàng</td>
            </tr>
          ) : (
            customers.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">{c.fullName}</td>
                <td className="p-4">
                  <div className="font-mono text-gray-600 dark:text-gray-300">{c.phoneNumber}</div>
                  <div className="text-xs text-gray-500">{c.email || "Chưa có email"}</div>
                </td>
                <td className="p-4 flex flex-col gap-1 items-start">
                  {c.isZaloFollower ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Zalo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400">
                      <XCircle className="w-3 h-3" /> No Zalo
                    </span>
                  )}
                  {c.isEmailSubscriber ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <CheckCircle2 className="w-3 h-3" /> Email
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400">
                      <XCircle className="w-3 h-3" /> No Email
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {c.tags && c.tags.length > 0 ? (
                      c.tags.map((t: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded">
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Chưa phân nhóm</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-center font-medium">{c.totalOrders || 0}</td>
                <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                  {(c.totalSpent || 0).toLocaleString("vi-VN")} đ
                </td>
                <td className="p-4 text-right text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
