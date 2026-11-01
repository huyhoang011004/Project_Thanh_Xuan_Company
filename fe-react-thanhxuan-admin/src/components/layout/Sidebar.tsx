import { NavLink } from 'react-router-dom';
import { useTenant } from '@/app/TenantContext';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Mail,
  Users,
  Settings,
  ShoppingBag,
  Truck,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { tenant, config } = useTenant();

  const navItems = [
    {
      title: 'Tổng Quan',
      to: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Bài Viết SEO',
      to: '/articles',
      icon: FileText,
    },
    {
      title: 'Chuyên Mục',
      to: '/categories',
      icon: FolderTree,
    },
    {
      title: 'Yêu Cầu Tư Vấn',
      to: '/contacts',
      icon: Mail,
    },
    {
      title: 'Khách Hàng (CRM)',
      to: '/crm',
      icon: Users,
    },
    {
      title: tenant === 'laundry' ? 'Đơn Giặt Là' : 'Đơn Chuyển Nhà',
      to: '/orders',
      icon: tenant === 'laundry' ? ShoppingBag : Truck,
    },
    {
      title: 'Cài Đặt Website',
      to: '/settings',
      icon: Settings,
    },
    {
      title: 'Tài Khoản & Quyền',
      to: '/users',
      icon: ShieldCheck,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Name */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-black text-sm shadow-xs"
              style={{ backgroundColor: config.colorHex }}
            >
              TX
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-none">{config.shortName}</div>
              <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">CMS Portal</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Quản Trị
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-slate-200 p-4 text-xs text-slate-400">
          <div>Thanh Xuân Multi-Tenant CMS</div>
          <div className="text-[10px] mt-0.5 text-slate-400">Phiên bản 1.0 &bull; React SPA</div>
        </div>
      </aside>
    </>
  );
}
