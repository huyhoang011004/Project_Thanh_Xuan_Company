import { useAuth } from '@/features/auth/useAuth';
import { useTenant } from '@/app/TenantContext';
import { TenantSwitcher } from './TenantSwitcher';
import { Menu, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { config } = useTenant();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Mở Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{config.brandName}</span>
          <span className="text-xs text-slate-400 font-medium">|</span>
          <span className="text-xs text-slate-500">{config.portalTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <TenantSwitcher />

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-left">
            <UserCircle className="h-8 w-8 text-slate-400" />
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-slate-800">{user?.name || 'Quản trị viên'}</div>
              <div className="text-[10px] text-slate-400 font-medium">{user?.role || 'ADMIN'}</div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-8 px-2"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
