// Adhering to SOLID & Design Patterns
"use client";


import { UserCheck } from "lucide-react";
import { useAdminCrm } from "./useAdminCrm";
import { CrmManagerToolbarComponent, CrmManagerTableComponent } from "./components";

export function CrmManagerPage() {
  const {
    customers,
    loading,
    search,
    setSearch,
    zaloFilter,
    setZaloFilter,
    emailFilter,
    setEmailFilter,
    fetchCustomers,
  } = useAdminCrm();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-indigo-600" /> Quản lý Khách hàng (CRM)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quản lý thông tin tệp khách hàng, trạng thái Follow Zalo OA và phân nhóm chăm sóc
          </p>
        </div>
      </div>

      <CrmManagerToolbarComponent
        search={search}
        setSearch={setSearch}
        zaloFilter={zaloFilter}
        setZaloFilter={setZaloFilter}
        emailFilter={emailFilter}
        setEmailFilter={setEmailFilter}
        onRefresh={fetchCustomers}
      />

      <CrmManagerTableComponent customers={customers} loading={loading} />
    </div>
  );
}

export { CrmManagerPage as CrmListPage };
