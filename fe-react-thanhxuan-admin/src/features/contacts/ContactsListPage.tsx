import { useState } from 'react';
import { useContacts } from './useContacts';
import { ContactStatus } from './contacts.types';
import { useTenant } from '@/app/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Search, RefreshCw, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { formatDateTimeVN } from '@/lib/utils';

export function ContactsListPage() {
  const { config } = useTenant();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { contacts, isLoading, refetch, updateStatus, deleteContact } = useContacts(
    search || undefined,
    statusFilter !== 'ALL' ? statusFilter : undefined
  );

  const handleStatusChange = async (id: string, newStatus: ContactStatus) => {
    await updateStatus({ id, status: newStatus });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa liên hệ của "${name}"?`)) {
      await deleteContact(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Yêu Cầu Tư Vấn & Báo Giá</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Khách hàng để lại thông tin liên hệ tại <span className="font-semibold text-primary">{config.brandName}</span>
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Làm mới
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm theo họ tên, số điện thoại hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="NEW">Mới tiếp nhận</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="RESOLVED">Đã hoàn tất</option>
            <option value="SPAM">Tin rác / Spam</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">STT</TableHead>
              <TableHead>Khách Hàng</TableHead>
              <TableHead>Nội Dung / Yêu Cầu</TableHead>
              <TableHead className="text-center">Trạng Thái</TableHead>
              <TableHead className="text-center">Thời Gian</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Đang tải danh sách liên hệ...
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Chưa có yêu cầu liên hệ nào.
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((c, idx) => (
                <TableRow key={c._id}>
                  <TableCell className="text-center font-medium text-slate-500">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{c.fullName}</div>
                    <div className="font-mono text-xs text-primary font-medium">{c.phone}</div>
                    {c.email && <div className="text-xs text-slate-400">{c.email}</div>}
                  </TableCell>
                  <TableCell>
                    {c.serviceCategory && (
                      <Badge variant="outline" className="mb-1 text-[10px]">
                        {c.serviceCategory}
                      </Badge>
                    )}
                    <div className="text-xs text-slate-700 line-clamp-2">{c.message || 'Yêu cầu tư vấn'}</div>
                    {c.sourceUrl && (
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">Từ: {c.sourceUrl}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        c.status === 'RESOLVED'
                          ? 'success'
                          : c.status === 'PROCESSING'
                          ? 'warning'
                          : c.status === 'SPAM'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {c.status === 'RESOLVED'
                        ? 'Đã xử lý'
                        : c.status === 'PROCESSING'
                        ? 'Đang xử lý'
                        : c.status === 'SPAM'
                        ? 'Spam'
                        : 'Mới'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-500">
                    {formatDateTimeVN(c.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {c.status !== 'RESOLVED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(c._id, 'RESOLVED')}
                          className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Đánh dấu đã xử lý"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      {c.status === 'NEW' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(c._id, 'PROCESSING')}
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="Đánh dấu đang xử lý"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(c._id, c.fullName)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
