import { useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useTenant } from '@/app/TenantContext';
import { TenantSwitcher } from './TenantSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Menu, UserCircle } from 'lucide-react';

interface HeaderProps {
  toggleMobileMenu?: () => void;
}

export function Header({ toggleMobileMenu }: HeaderProps) {
  const { user } = useAuth();
  const { config } = useTenant();
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard') || pathname === '/') return 'Tổng Quan Hệ Thống';
    if (pathname.startsWith('/orders')) return 'Quản Lý Đơn Hàng';
    if (pathname.startsWith('/crm')) return 'Khách Hàng (CRM)';
    if (pathname.startsWith('/zalo-marketing')) return 'Zalo Marketing Automation';
    if (pathname.startsWith('/email-marketing')) return 'Email Marketing Automation';
    if (pathname.startsWith('/categories')) return 'Danh Mục Dịch Vụ';
    if (pathname.startsWith('/articles')) return 'Quản Lý Bài Viết & SEO';
    if (pathname.startsWith('/contacts')) return 'Yêu Cầu Liên Hệ & Tư Vấn';
    if (pathname.startsWith('/users')) return 'Tài Khoản & Phân Quyền';
    if (pathname.startsWith('/settings')) return 'Cài Đặt Hệ Thống & Website';
    return config.portalTitle;
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="h-16 md:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 shadow-sm transition-colors duration-300">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Mở Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">
            {pageTitle}
          </h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">
            {config.brandName} &bull; Cổng Quản Trị Trung Tâm
          </p>
        </div>
      </div>

      {/* Right: Tenant Switcher, Theme Toggle & User Info */}
      <div className="flex items-center gap-3 md:gap-5">
        <TenantSwitcher />

        <ThemeToggle />

        <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {user?.email || 'admin@thanhxuan.vn'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 dark:from-slate-800 to-indigo-50 dark:to-slate-700 border border-blue-100 dark:border-slate-600 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
            <UserCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
