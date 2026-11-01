import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { settingsService } from './settings.service';
import { WebsiteSettings } from './settings.types';
import { useTenant } from '@/app/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '@/lib/api-client';

export function GeneralSettingsPage() {
  const { tenant, config } = useTenant();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

  const { data: initialSettings, isLoading, refetch } = useQuery({
    queryKey: ['settings', tenant],
    queryFn: () => settingsService.getSettings(),
  });

  const [form, setForm] = useState<WebsiteSettings>({
    hotline: '',
    email: '',
    address: '',
    googleMapsLink: '',
    description: '',
    facebookLink: '',
    zaloLink: '',
    headerConfig: { marqueeText: '', hotlineLabel: 'Hotline 24/7' },
    footerConfig: { companyDescription: '', copyrightText: '' },
    homepageConfig: { heroTitle: '', heroSubtitle: '' },
  });

  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setForm((prev) => ({
        ...prev,
        ...initialSettings,
        headerConfig: { ...prev.headerConfig, ...initialSettings.headerConfig },
        footerConfig: { ...prev.footerConfig, ...initialSettings.footerConfig },
        homepageConfig: { ...prev.homepageConfig, ...initialSettings.homepageConfig },
      }));
    }
  }, [initialSettings]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<WebsiteSettings>) => settingsService.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', tenant] });
      setIsSavedSuccess(true);
      toast.success('Lưu cài đặt website thành công!');
      setTimeout(() => setIsSavedSuccess(false), 3000);
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi lưu cài đặt: ${getErrorMessage(err)}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cài Đặt Hệ Thống & Website</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cấu hình thông tin liên hệ, banner và thương hiệu của <span className="font-semibold text-primary">{config.brandName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Tải lại
          </Button>
          <Button type="submit" size="sm" disabled={updateMutation.isPending} className="gap-1.5 font-semibold">
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        </div>
      </div>

      {isSavedSuccess && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
          Cập nhật thông tin website thành công!
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Đang tải cấu hình website...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">Thông Tin Liên Hệ</TabsTrigger>
            <TabsTrigger value="header">Header & Chân Trang</TabsTrigger>
            <TabsTrigger value="homepage">Trang Chủ & Banner</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông Tin Liên Hệ Cốt Lõi</CardTitle>
                <CardDescription>Hiển thị trên toàn bộ website và các nút gọi khẩn cấp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Hotline tư vấn *</label>
                    <Input
                      value={form.hotline}
                      onChange={(e) => setForm({ ...form, hotline: e.target.value })}
                      placeholder="VD: 098.xxx.xxxx"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Email hỗ trợ *</label>
                    <Input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="lienhe@..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Địa chỉ văn phòng / xưởng</label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Số nhà, phố, quận/huyện..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Liên kết Zalo OA</label>
                    <Input
                      value={form.zaloLink || ''}
                      onChange={(e) => setForm({ ...form, zaloLink: e.target.value })}
                      placeholder="https://zalo.me/..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Liên kết Fanpage Facebook</label>
                    <Input
                      value={form.facebookLink || ''}
                      onChange={(e) => setForm({ ...form, facebookLink: e.target.value })}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cấu Hình Đầu & Chân Trang</CardTitle>
                <CardDescription>Dòng chữ chạy marquee, copyright và mô tả ngắn footer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Dòng chữ chạy Marquee Header</label>
                  <Input
                    value={form.headerConfig?.marqueeText || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        headerConfig: { ...form.headerConfig, marqueeText: e.target.value },
                      })
                    }
                    placeholder="VD: Dịch vụ giặt sấy uy tín - Giao nhận tận nơi 24/7..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Mô tả tóm tắt ở Chân Trang (Footer)</label>
                  <textarea
                    value={form.footerConfig?.companyDescription || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        footerConfig: { ...form.footerConfig, companyDescription: e.target.value },
                      })
                    }
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Mô tả công ty hiển thị dưới chân trang..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homepage">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hero Banner Trang Chủ</CardTitle>
                <CardDescription>Tiêu đề chính và phụ hiển thị trên cùng của website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tiêu đề Hero (H1)</label>
                  <Input
                    value={form.homepageConfig?.heroTitle || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        homepageConfig: { ...form.homepageConfig, heroTitle: e.target.value },
                      })
                    }
                    placeholder="VD: Chuyển Nhà Tiết Kiệm - Nhanh Chóng & An Toàn"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Phụ đề Hero (Subtitle)</label>
                  <Input
                    value={form.homepageConfig?.heroSubtitle || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        homepageConfig: { ...form.homepageConfig, heroSubtitle: e.target.value },
                      })
                    }
                    placeholder="VD: Đội xe tải đa tải trọng, báo giá minh bạch theo km"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </form>
  );
}
