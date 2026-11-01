import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'general');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

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
    headerConfig: { marqueeText: '', hotlineLabel: 'Hotline 24/7', logoText1: 'Thanh Xuân' },
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
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Cài Đặt Hệ Thống & Website
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cấu hình thông tin liên hệ, banner và thương hiệu của{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">{config.brandName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 cursor-pointer dark:bg-slate-800 dark:border-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tải lại
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={updateMutation.isPending}
            className="gap-1.5 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        </div>
      </div>

      {isSavedSuccess && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3.5 text-sm text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Cập nhật thông tin website thành công!
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-gray-400 dark:text-gray-500">Đang tải cấu hình website...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="mb-4 inline-flex gap-1 p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-xl">
              <TabsTrigger value="general">Thông Tin Liên Hệ</TabsTrigger>
              <TabsTrigger value="header">Header & Logo</TabsTrigger>
              <TabsTrigger value="footer">Chân Trang</TabsTrigger>
              <TabsTrigger value="home">Trang Chủ</TabsTrigger>
              <TabsTrigger value="vesinh">Trang Vệ Sinh</TabsTrigger>
              <TabsTrigger value="service">Trang Dịch Vụ</TabsTrigger>
              <TabsTrigger value="about">Trang Giới Thiệu</TabsTrigger>
              <TabsTrigger value="contact">Trang Liên Hệ</TabsTrigger>
              <TabsTrigger value="zalo">Tích Hợp Zalo OA</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: GENERAL */}
          <TabsContent value="general">
            <Card className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 dark:text-gray-100">Thông Tin Liên Hệ Cốt Lõi</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Hiển thị trên toàn bộ website và các nút gọi khẩn cấp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Hotline tư vấn *</label>
                    <Input
                      value={form.hotline}
                      onChange={(e) => setForm({ ...form, hotline: e.target.value })}
                      placeholder="VD: 098.xxx.xxxx"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email hỗ trợ *</label>
                    <Input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="lienhe@..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Địa chỉ văn phòng / xưởng</label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Số nhà, phố, quận/huyện..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Liên kết Zalo OA</label>
                    <Input
                      value={form.zaloLink || ''}
                      onChange={(e) => setForm({ ...form, zaloLink: e.target.value })}
                      placeholder="https://zalo.me/..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Liên kết Fanpage Facebook</label>
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

          {/* TAB 2: HEADER */}
          <TabsContent value="header">
            <Card className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 dark:text-gray-100">Cấu Hình Header & Marquee</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Dòng chữ chạy đầu trang, nhãn hotline và logo văn bản
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tên Logo dòng 1</label>
                    <Input
                      value={form.headerConfig?.logoText1 || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          headerConfig: { ...form.headerConfig, logoText1: e.target.value },
                        })
                      }
                      placeholder="VD: Thanh Xuân"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nhãn Hotline Header</label>
                    <Input
                      value={form.headerConfig?.hotlineLabel || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          headerConfig: { ...form.headerConfig, hotlineLabel: e.target.value },
                        })
                      }
                      placeholder="VD: Hotline 24/7"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Dòng chữ chạy Marquee Header</label>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: FOOTER */}
          <TabsContent value="footer">
            <Card className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 dark:text-gray-100">Cấu Hình Chân Trang (Footer)</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Mô tả doanh nghiệp, bản quyền và các chính sách hiển thị cuối trang
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Mô tả tóm tắt ở Chân Trang</label>
                  <textarea
                    value={form.footerConfig?.companyDescription || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        footerConfig: { ...form.footerConfig, companyDescription: e.target.value },
                      })
                    }
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả công ty hiển thị dưới chân trang..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Bản quyền Copyright</label>
                  <Input
                    value={form.footerConfig?.copyrightText || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        footerConfig: { ...form.footerConfig, copyrightText: e.target.value },
                      })
                    }
                    placeholder="VD: © 2026 Thanh Xuân Company. All rights reserved."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: HOMEPAGE */}
          <TabsContent value="home">
            <Card className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 dark:text-gray-100">Hero Banner Trang Chủ</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Tiêu đề chính và phụ hiển thị trên cùng của website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tiêu đề Hero (H1)</label>
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
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phụ đề Hero (Subtitle)</label>
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

          {/* TAB 5: VESINH */}
          <TabsContent value="vesinh">
            <Card className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 dark:text-gray-100">Cấu Hình Trang Vệ Sinh Công Nghiệp</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Thiết lập nội dung và dịch vụ làm sạch sau xây dựng, sofa, thảm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Đã liên kết dữ liệu theo phân hệ {config.brandName}. Bạn có thể cập nhật các trường chi tiết hoặc quản lý bài viết tương ứng trong mục Bài viết SEO.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: SERVICE */}
          <TabsContent value="service">
            <Card className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 dark:text-gray-100">Cấu Hình Trang Dịch Vụ</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Thông tin các gói dịch vụ và bảng giá công khai
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cấu hình các gói dịch vụ hiển thị tại trang /dich-vu trên hệ thống {config.brandName}.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 7: ABOUT */}
          <TabsContent value="about">
            <Card className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 dark:text-gray-100">Cấu Hình Trang Giới Thiệu</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Câu chuyện thương hiệu, sứ mệnh và giá trị cốt lõi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Quản lý nội dung bài viết và hình ảnh giới thiệu công ty {config.brandName}.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 8: CONTACT */}
          <TabsContent value="contact">
            <Card className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 dark:text-gray-100">Cấu Hình Trang Liên Hệ</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Bản đồ chỉ đường và biểu mẫu tiếp nhận thông tin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Đường dẫn Google Maps Embed</label>
                  <Input
                    value={form.googleMapsLink || ''}
                    onChange={(e) => setForm({ ...form, googleMapsLink: e.target.value })}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 9: ZALO OA */}
          <TabsContent value="zalo">
            <Card className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 dark:text-gray-100">Tích Hợp Zalo Official Account (OA)</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Kết nối OA ID và thông báo tự động cho khách hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Đường dẫn Zalo OA</label>
                  <Input
                    value={form.zaloLink || ''}
                    onChange={(e) => setForm({ ...form, zaloLink: e.target.value })}
                    placeholder="https://zalo.me/..."
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
