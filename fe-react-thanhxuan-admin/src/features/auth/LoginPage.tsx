import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useTenant } from '@/app/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User, AlertCircle, ArrowRightLeft } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { tenant, config, switchTenant } = useTenant();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng nhập không thành công.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTenant = () => {
    switchTenant(tenant === 'laundry' ? 'moving' : 'laundry');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Switch Tenant Banner */}
        <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hệ Thống:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bgLightClass}`}>
              {config.brandName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleTenant}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Đổi sang {tenant === 'laundry' ? 'Chuyển Nhà' : 'Giặt Là'}
          </button>
        </div>

        <Card className="border-slate-200/80 shadow-md">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Đăng Nhập Quản Trị
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {config.portalTitle}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700" htmlFor="username">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Nhập username quản trị"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-semibold shadow-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Hệ sinh thái dịch vụ Thanh Xuân Company &bull; Bảo mật đa lớp
        </p>
      </div>
    </div>
  );
}
