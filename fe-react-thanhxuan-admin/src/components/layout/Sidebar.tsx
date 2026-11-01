import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useTenant } from '@/app/TenantContext';
import {
  LayoutDashboard,
  ShoppingCart,
  UserCheck,
  MessageSquare,
  Mail,
  FolderTree,
  FileText,
  Headset,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (val: boolean) => void;
}

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { tenant } = useTenant();

  const [isSettingsOpen, setIsSettingsOpen] = useState(
    pathname.startsWith('/settings'),
  );

  const handleLogout = async () => {
    logout();
    if (setIsMobileOpen) setIsMobileOpen(false);
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Đơn hàng', path: '/orders', icon: ShoppingCart },
    { name: 'Khách hàng (CRM)', path: '/crm', icon: UserCheck },
    { name: 'Zalo Marketing', path: '/zalo-marketing', icon: MessageSquare },
    { name: 'Email Marketing', path: '/email-marketing', icon: Mail },
    { name: 'Danh mục', path: '/categories', icon: FolderTree },
    { name: 'Bài viết', path: '/articles', icon: FileText },
    { name: 'Liên hệ', path: '/contacts', icon: Headset },
    { name: 'Tài khoản', path: '/users', icon: Users },
    { name: 'Cấu hình', path: '/settings', icon: Settings },
  ];

  const subItems = [
    { name: 'Header', path: '/settings?tab=header', tab: 'header' },
    { name: 'Footer', path: '/settings?tab=footer', tab: 'footer' },
    { name: 'Trang chủ', path: '/settings?tab=home', tab: 'home' },
    { name: 'Trang vệ sinh', path: '/settings?tab=vesinh', tab: 'vesinh' },
    { name: 'Trang dịch vụ', path: '/settings?tab=service', tab: 'service' },
    { name: 'Trang giới thiệu', path: '/settings?tab=about', tab: 'about' },
    { name: 'Trang liên hệ', path: '/settings?tab=contact', tab: 'contact' },
    { name: 'Tích hợp Zalo OA', path: '/settings?tab=zalo', tab: 'zalo' },
  ];

  const brandTitle = tenant === 'moving' ? 'Chuyển Nhà' : 'Thanh Xuân';

  return (
    <aside
      className={`${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } fixed md:relative z-50 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col h-full transition-all duration-300`}
      style={{
        width: isCollapsed ? 80 : 260,
      }}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-800">
        <div
          className={`flex items-center gap-3 overflow-hidden ${
            isCollapsed ? 'justify-center w-full' : ''
          }`}
        >
          <div className="w-10 h-10 min-w-[40px] rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
            TX
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 dark:from-gray-100 to-gray-600 dark:to-gray-300 whitespace-nowrap transition-colors duration-300">
              {brandTitle}
            </h1>
          )}
        </div>
      </div>

      {/* Nút Thu Phóng Sidebar trên Desktop */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-24 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full p-1 shadow-sm z-20 cursor-pointer"
        title={isCollapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Nút đóng Sidebar trên mobile */}
      <button
        type="button"
        onClick={() => setIsMobileOpen?.(false)}
        className="md:hidden absolute right-4 top-6 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors z-20 cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Nav List */}
      <nav
        className={`p-4 flex-1 space-y-1 overflow-y-auto ${
          isCollapsed ? 'px-2' : 'px-4'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.name === 'Cấu hình') {
            const isMenuActive = pathname.startsWith('/settings');

            return (
              <div key={item.path} className="space-y-1">
                <div
                  onClick={() => {
                    if (isCollapsed) setIsCollapsed(false);
                    setIsSettingsOpen(!isSettingsOpen);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group font-medium cursor-pointer ${
                    isMenuActive && !isSettingsOpen
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${
                        isMenuActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`}
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isSettingsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </div>

                {/* Submenu */}
                {!isCollapsed && isSettingsOpen && (
                  <div className="pl-11 space-y-1 mt-1 overflow-hidden">
                    {subItems.map((subItem) => {
                      const isSubActive =
                        pathname === '/settings' &&
                        search.includes(`tab=${subItem.tab}`);
                      return (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => setIsMobileOpen?.(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm ${
                            isSubActive
                              ? 'bg-gradient-to-r from-blue-50 dark:from-blue-900/30 to-indigo-50/50 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-800/30 font-semibold'
                              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
                          }`}
                        >
                          <span>{subItem.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen?.(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 dark:from-blue-900/30 to-indigo-50/50 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-800/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                }`}
              />
              {!isCollapsed && (
                <span
                  className={`font-medium ${
                    isActive ? 'font-semibold text-blue-700 dark:text-blue-400' : ''
                  }`}
                >
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800 mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800 outline-none cursor-pointer ${
            isCollapsed ? 'px-0' : ''
          }`}
          title={isCollapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && 'Đăng xuất'}
        </button>
      </div>
    </aside>
  );
}
