import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { OrderItem } from './orders.types';
import { useTenant } from '@/app/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingBag, Truck, Search, RefreshCw, MapPin, Calendar } from 'lucide-react';
import { formatVND, formatDateVN } from '@/lib/utils';

export function OrdersListPage() {
  const { tenant, config } = useTenant();
  const [search, setSearch] = useState('');

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['orders', tenant, search],
    queryFn: async () => {
      try {
        const endpoint = tenant === 'laundry' ? '/orders' : '/moving/orders';
        const res = await apiClient.get<OrderItem[] | { data: OrderItem[] }>(endpoint, {
          params: { search: search || undefined },
        });
        const d = res.data;
        return Array.isArray(d) ? d : d.data || [];
      } catch {
        return [];
      }
    },
  });

  const isLaundry = tenant === 'laundry';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {isLaundry ? (
              <ShoppingBag className="h-6 w-6 text-primary" />
            ) : (
              <Truck className="h-6 w-6 text-primary" />
            )}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isLaundry ? 'Quản Lý Đơn Giặt Là' : 'Đơn Đặt Lịch & Báo Giá Chuyển Nhà'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến trình đơn hàng của <span className="font-semibold text-primary">{config.brandName}</span>
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
            placeholder={
              isLaundry
                ? 'Tìm theo mã đơn, khách hàng, số điện thoại...'
                : 'Tìm theo mã đơn, lộ trình, số điện thoại...'
            }
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
              <TableHead>Mã Đơn / Khách Hàng</TableHead>
              <TableHead>{isLaundry ? 'Dịch Vụ / Khối Lượng' : 'Lộ Trình / Xe Tải'}</TableHead>
              <TableHead className="text-center">{isLaundry ? 'Trạng Thái' : 'Ngày Chuyển'}</TableHead>
              <TableHead className="text-right">Tổng Tiền</TableHead>
              <TableHead className="text-center">Ngày Tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Đang tải danh sách đơn hàng...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Chưa có đơn hàng nào trong hệ thống.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o, idx) => (
                <TableRow key={o._id}>
                  <TableCell className="text-center font-medium text-slate-500">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-mono text-xs font-bold text-primary">{o.orderCode}</div>
                    <div className="font-semibold text-slate-900">{o.customerName}</div>
                    <div className="text-xs text-slate-400 font-mono">{o.phone}</div>
                  </TableCell>
                  <TableCell>
                    {isLaundry ? (
                      <div>
                        <div className="text-xs font-medium text-slate-800">{o.laundryServiceType || 'Giặt sấy công nghiệp'}</div>
                        {o.weightOrPieces && <div className="text-xs text-slate-400">{o.weightOrPieces}</div>}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-slate-800 font-medium">
                          <Truck className="h-3 w-3 text-primary" />
                          <span>{o.truckType || 'Xe tải 1.25 tấn'}</span>
                          {o.movingType && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 ml-1">
                              {o.movingType === 'ALL_INCLUSIVE' ? 'Trọn gói' : 'Thuê xe'}
                            </Badge>
                          )}
                        </div>
                        {o.pickupAddress && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="line-clamp-1">{o.pickupAddress} &rarr; {o.deliveryAddress}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {isLaundry ? (
                      <Badge variant="secondary">{o.status || 'Chờ tiếp nhận'}</Badge>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-xs text-slate-700">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{o.movingDate ? formatDateVN(o.movingDate) : 'Chờ xác nhận'}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-slate-900">
                    {o.totalAmount ? formatVND(o.totalAmount) : 'Liên hệ'}
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-500">
                    {formatDateVN(o.createdAt)}
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
