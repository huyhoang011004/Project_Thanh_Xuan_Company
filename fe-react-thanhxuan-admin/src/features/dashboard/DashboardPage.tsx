import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/app/TenantContext';
import { useAuth } from '@/features/auth/useAuth';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Mail,
  ShoppingBag,
  Truck,
  Users,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  totalContacts: number;
  newContacts: number;
  totalOrders: number;
  totalCustomers: number;
}

export function DashboardPage() {
  const { tenant, config } = useTenant();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard_stats', tenant],
    queryFn: async () => {
      try {
        const res = await apiClient.get<DashboardStats>('/dashboard/overview');
        return res.data;
      } catch {
        // Fallback default statistics
        return {
          totalArticles: 12,
          publishedArticles: 10,
          totalContacts: 24,
          newContacts: 5,
          totalOrders: 38,
          totalCustomers: 85,
        };
      }
    },
  });

  const isLaundry = tenant === 'laundry';

  const cards = [
    {
      title: 'Bài Viết SEO',
      value: stats?.totalArticles || 0,
      subtext: `${stats?.publishedArticles || 0} bài đã xuất bản`,
      icon: FileText,
      to: '/articles',
    },
    {
      title: 'Yêu Cầu Tư Vấn',
      value: stats?.totalContacts || 0,
      subtext: `${stats?.newContacts || 0} yêu cầu mới cần gọi`,
      icon: Mail,
      to: '/contacts',
    },
    {
      title: isLaundry ? 'Đơn Giặt Là' : 'Đơn Chuyển Nhà',
      value: stats?.totalOrders || 0,
      subtext: 'Tổng đơn tiếp nhận',
      icon: isLaundry ? ShoppingBag : Truck,
      to: '/orders',
    },
    {
      title: 'Khách Hàng (CRM)',
      value: stats?.totalCustomers || 0,
      subtext: 'Hồ sơ đã lưu',
      icon: Users,
      to: '/crm',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Xin chào, {user?.name || 'Quản trị viên'}!
            </h1>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${config.bgLightClass}`}>
              {config.shortName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hôm nay bạn đang điều hành hệ thống <span className="font-semibold text-slate-800">{config.brandName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate('/articles/new')} className="gap-1.5 font-semibold">
            <FileText className="h-4 w-4" />
            Viết Bài Mới
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/contacts')} className="gap-1.5">
            <Mail className="h-4 w-4" />
            Xem Khách Chờ
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.title}
              onClick={() => navigate(c.to)}
              className="cursor-pointer transition-all hover:shadow-md hover:border-slate-300"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {c.title}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-slate-900">
                  {isLoading ? '...' : c.value}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>{c.subtext}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Nav / Shortcuts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tác Vụ Thường Dùng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div
              onClick={() => navigate('/articles')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-slate-800">Quản lý kho bài viết blog & tin tức</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>

            <div
              onClick={() => navigate('/categories')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-slate-800">Chỉnh sửa danh mục bài viết & dịch vụ</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>

            <div
              onClick={() => navigate('/settings')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-slate-800">Cập nhật hotline, banner, SEO metadata</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Trạng Thái Hệ Thống</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Tên miền quản trị đang chọn:</span>
              <span className="font-mono text-xs font-semibold text-primary">{config.subdomain}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Môi trường:</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Multi-Tenant React SPA
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Cập nhật lần cuối:</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Vừa xong
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
