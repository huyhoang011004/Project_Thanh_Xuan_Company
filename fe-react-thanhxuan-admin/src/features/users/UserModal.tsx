import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAccount, UserAccountPayload } from './users.types';

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserAccount | null;
  onSave: (payload: UserAccountPayload) => Promise<void>;
}

export function UserModal({ open, onOpenChange, user, onSave }: UserModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setPassword('');
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || 'ADMIN');
    } else {
      setUsername('');
      setPassword('');
      setName('');
      setEmail('');
      setPhone('');
      setRole('ADMIN');
    }
    setError(null);
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) {
      setError('Vui lòng điền tên đăng nhập và họ tên.');
      return;
    }
    if (!user && !password.trim()) {
      setError('Vui lòng tạo mật khẩu cho tài khoản mới.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        username: username.trim(),
        password: password.trim() || undefined,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu tài khoản.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <DialogHeader>
          <DialogTitle>{user ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Quản Trị'}</DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>

        <DialogContent className="space-y-4 py-4">
          {error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Tên đăng nhập *</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="VD: admin_ha, quanly_xe..."
              disabled={Boolean(user)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {user ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required={!user}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Họ và tên *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thanhxuan.vn"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Số điện thoại</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="098.xxx.xxxx"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Vai trò phân quyền</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
            >
              <option value="ADMIN">ADMIN — Toàn quyền hệ thống</option>
              <option value="MANAGER">MANAGER — Quản lý vận hành & Marketing</option>
              <option value="OPERATOR">OPERATOR — Điều phối & CSKH</option>
            </select>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu Tài Khoản'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
