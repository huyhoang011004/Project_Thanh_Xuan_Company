import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useTenant } from '@/app/TenantContext';
import { getErrorMessage } from '@/lib/api-client';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRightLeft,
} from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { tenant, config, switchTenant } = useTenant();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      const msg = 'Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username.trim(), password);
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTenant = () => {
    switchTenant(tenant === 'laundry' ? 'moving' : 'laundry');
  };

  const isLaundry = tenant === 'laundry';

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center isolate p-4 selection:bg-blue-200 dark:selection:bg-blue-900">
      {/* Light Mode Background Image */}
      <img
        src="https://tailkits.com/ui/iframe/assets/img/bg-5.png"
        alt="Background Light"
        className="absolute inset-0 -z-10 h-full w-full object-cover dark:hidden select-none pointer-events-none"
      />

      {/* Dark Mode Radial Background */}
      <div className="absolute inset-0 -z-10 h-full w-full hidden dark:block [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]" />

      {/* Top-Right Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Switch Tenant Pill */}
        <div className="flex items-center justify-between rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2.5 shadow-sm border border-white/60 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hệ Thống:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bgLightClass}`}>
              {config.brandName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleTenant}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/90 dark:bg-slate-800 px-3 py-1 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Đổi sang {isLaundry ? 'Chuyển Nhà' : 'Giặt Là'}
          </button>
        </div>

        {/* Glassmorphism Card */}
        <div className="w-full bg-white/90 dark:bg-black/20 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Quản Trị Viên
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Đăng nhập để vào hệ thống {config.brandName}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 rounded-xl text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                Tài khoản Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900/60 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 text-sm"
                  placeholder="Nhập tên đăng nhập"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900/60 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 text-sm"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-300 focus:outline-none transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-blue-600" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang kết nối...</span>
                </>
              ) : (
                <span>Đăng Nhập</span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Hệ sinh thái dịch vụ Thanh Xuân Company &bull; Bảo mật đa lớp
        </p>
      </div>
    </main>
  );
}
