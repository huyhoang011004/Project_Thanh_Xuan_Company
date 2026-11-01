import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CustomerItem } from './crm.types';
import { useTenant } from '@/app/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, RefreshCw, Phone, MapPin } from 'lucide-react';
import { formatVND, formatDateVN } from '@/lib/utils';

export function CrmListPage() {
  const { tenant, config } = useTenant();
  const [search, setSearch] = useState('');

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['customers', tenant, search],
    queryFn: async () => {
      try {
        const res = await apiClient.get<CustomerItem[] | { data: CustomerItem[] }>('/crm/customers', {
          params: { search: search || undefined },
        });
        const d = res.data;
        return Array.isArray(d) ? d : d.data || [];
      } catch {
        return [];
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản Lý Khách Hàng (CRM)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hồ sơ khách hàng và lịch sử sử dụng dịch vụ tại <span className="font-semibold text-primary">{config.brandName}</span>
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Làm mới
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm theo tên khách hàng, số điện thoại hoặc địa chỉ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">STT</TableHead>
              <TableHead>Khách Hàng</TableHead>
              <TableHead>Liên Hệ</TableHead>
              <TableHead className="text-center">Số Đơn Hàng</TableHead>
              <TableHead className="text-right">Tổng Chi Tiêu</TableHead>
              <TableHead className="text-center">Ngày Tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Đang tải danh sách khách hàng...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Chưa có dữ liệu khách hàng.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c, idx) => (
                <TableRow key={c._id}>
                  <TableCell className="text-center font-medium text-slate-500">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    {c.address && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">{c.address}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email && <div className="text-xs text-slate-400">{c.email}</div>}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-xs text-slate-700">
                    {c.totalOrders || 0}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-slate-900">
                    {formatVND(c.totalSpent || 0)}
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-500">
                    {formatDateVN(c.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
