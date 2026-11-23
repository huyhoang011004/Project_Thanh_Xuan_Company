"use client";
// Adhering to SOLID & Design Patterns
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X, Mail } from 'lucide-react';

const userSchema = z.object({
  username: z.string().min(3, { message: 'Tên đăng nhập từ 3 ký tự trở lên' }),
  email: z.string().min(1, { message: 'Email là bắt buộc' }).email({ message: 'Định dạng Email không hợp lệ' }),
  password: z.string().optional().or(z.literal('')),
  role: z.string(),
  receiveEmailNotifications: z.boolean(),
});

export type UserFormData = z.infer<typeof userSchema>;

export interface EditableUser {
  _id?: string;
  username?: string;
  email?: string;
  role?: string;
  receiveEmailNotifications?: boolean;
  [key: string]: unknown;
}

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  onSubmit: (data: UserFormData, reset: () => void) => void;
  error: string | null;
  isPending: boolean;
  editingUser?: EditableUser | null;
}

export function AccountEditorModal({ isModalOpen, setIsModalOpen, onSubmit, error, isPending, editingUser }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { username: '', email: '', password: '', role: 'staff', receiveEmailNotifications: true },
  });

  useEffect(() => {
    if (isModalOpen && editingUser) {
      setValue('username', editingUser.username || '');
      setValue('email', editingUser.email || '');
      setValue('role', editingUser.role || 'staff');
      setValue('receiveEmailNotifications', editingUser.receiveEmailNotifications ?? true);
      setValue('password', '');
    } else if (isModalOpen) {
      reset({ username: '', email: '', password: '', role: 'staff', receiveEmailNotifications: true });
    }
  }, [isModalOpen, editingUser, setValue, reset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, setIsModalOpen]);

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data, reset);
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn border border-gray-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">
            {editingUser ? "Chỉnh sửa Tài Khoản" : "Thêm Tài Khoản Mới"}
          </h3>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            aria-label="Đóng modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên đăng nhập <span className="text-red-500">*</span>
            </label>
            <input
              {...register('username')}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Nhập username"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Địa chỉ Email (Nhận thông báo) <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="nhanvien@thanhxuanlaundry.vn"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mật khẩu</label>
            <input
              type="password"
              {...register('password')}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder={editingUser ? "Nhập để thay đổi mật khẩu" : "Để trống mặc định là 123456"}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Vai trò (Role)</label>
            <select
              {...register('role')}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 dark:text-slate-100"
            >
              <option value="ADMIN">Quản trị viên cấp cao (ADMIN)</option>
              <option value="MANAGER">Quản lý điều hành (MANAGER)</option>
              <option value="OPERATOR">Điều phối viên (OPERATOR)</option>
              <option value="staff">Nhân viên hỗ trợ (STAFF)</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>

          <div className="flex items-start gap-3 bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 mt-2">
            <input
              type="checkbox"
              id="receiveEmailNotifications"
              {...register('receiveEmailNotifications')}
              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="receiveEmailNotifications" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <strong className="block text-slate-900 dark:text-white mb-0.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Bật nhận email thông báo
              </strong>
              Tự động nhận mail khi có yêu cầu liên hệ hoặc đơn hàng mới từ khách hàng
            </label>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 text-sm disabled:opacity-70"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              <span>Xác nhận</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
