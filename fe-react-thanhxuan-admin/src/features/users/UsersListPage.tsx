import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersService } from './users.service';
import { UserAccount, UserAccountPayload } from './users.types';
import { UserModal } from './UserModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '@/lib/api-client';

export function UsersListPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin_users'],
    queryFn: () => usersService.getList(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: UserAccountPayload) => usersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      toast.success('Tạo tài khoản quản trị thành công!');
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi tạo tài khoản: ${getErrorMessage(err)}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UserAccountPayload> }) =>
      usersService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      toast.success('Cập nhật tài khoản thành công!');
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi cập nhật tài khoản: ${getErrorMessage(err)}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      toast.success('Đã xóa tài khoản thành công!');
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi xóa tài khoản: ${getErrorMessage(err)}`);
    },
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSave = async (payload: UserAccountPayload) => {
    if (editingUser) {
      await updateMutation.mutateAsync({ id: editingUser._id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa tài khoản "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tài Khoản Quản Trị & Phân Quyền</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị nhân sự quản trị hệ thống đa thương hiệu Thanh Xuân
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </Button>
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 font-semibold">
            <Plus className="h-4 w-4" />
            Thêm Tài Khoản
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">STT</TableHead>
              <TableHead>Tài Khoản / Tên</TableHead>
              <TableHead>Email / Điện Thoại</TableHead>
              <TableHead className="text-center">Vai Trò</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                  Đang tải danh sách tài khoản...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                  Chưa có tài khoản nào.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u, idx) => (
                <TableRow key={u._id}>
                  <TableCell className="text-center font-medium text-slate-500">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="font-mono text-xs text-slate-400">@{u.username}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-700">{u.email || '—'}</div>
                    {u.phone && <div className="text-xs text-slate-400 font-mono">{u.phone}</div>}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(u)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-primary"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(u._id, u.name)}
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

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editingUser}
        onSave={handleSave}
      />
    </div>
  );
}
