"use client";


import { Trash2, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";
import type { IHomepageConfig } from "../../admin-settings.types";

interface Props {
  homepageConfig: IHomepageConfig;
  handleHomepageChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export function HomeHeroFormSection({
  homepageConfig,
  handleHomepageChange,
}: Props) {
  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "heroBannerImage" | "heroVideoPoster" | "heroSideImage",
    successMsg: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { success?: boolean; url?: string; message?: string };
      if (data.success && data.url) {
        handleHomepageChange({
          target: { name: field, value: data.url },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
        toast.success(successMsg);
      } else {
        toast.error("Lỗi upload: " + (data.message || "Không xác định"));
      }
    } catch {
      toast.error("Lỗi upload ảnh");
    }
    e.target.value = "";
  };

  const removeImage = (
    field: "heroBannerImage" | "heroVideoPoster" | "heroSideImage",
  ) => {
    handleHomepageChange({
      target: { name: field, value: "" },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="space-y-8">
      {/* 1. Hero Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-2">
          Bìa trang chủ (Hero Section)
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tiêu đề chính
            </label>
            <input
              type="text"
              name="heroTitle"
              value={homepageConfig.heroTitle || ""}
              onChange={handleHomepageChange}
              placeholder="VD: Dịch vụ Giặt sấy & Vệ sinh Chuyên nghiệp"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Phụ đề
            </label>
            <textarea
              name="heroSubtitle"
              value={homepageConfig.heroSubtitle || ""}
              onChange={handleHomepageChange}
              rows={2}
              placeholder="VD: Mang đến sự chăm sóc tốt nhất cho trang phục và không gian sống của bạn..."
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Ảnh Nền (Background Image)
            </label>
            <div className="flex flex-col">
              <div className="relative w-full h-48 md:h-64 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 overflow-hidden group cursor-pointer bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                {homepageConfig.heroBannerImage ? (
                  <img
                    src={homepageConfig.heroBannerImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs">Nhấn để thêm ảnh</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) =>
                    uploadImage(e, "heroBannerImage", "Upload ảnh thành công")
                  }
                />
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all pointer-events-none">
                  <span className="text-white text-sm font-medium">Đổi ảnh</span>
                </div>
              </div>
              {homepageConfig.heroBannerImage && (
                <button
                  type="button"
                  onClick={() => removeImage("heroBannerImage")}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 w-max"
                >
                  <Trash2 className="w-3 h-3" /> Xóa ảnh
                </button>
              )}
            </div>
          </div>

          {/* Video Xưởng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              URL Video Vận Hành Xưởng (Bên trái Hero)
            </label>
            <input
              type="text"
              name="heroVideoUrl"
              value={homepageConfig.heroVideoUrl || ""}
              onChange={handleHomepageChange}
              placeholder="VD: https://assets.example.com/videos/laundry-factory.mp4"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Video Poster */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Ảnh Poster Đại Diện Video
            </label>
            <div className="flex flex-col">
              <div className="relative w-full h-40 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 overflow-hidden group cursor-pointer bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                {homepageConfig.heroVideoPoster ? (
                  <img
                    src={homepageConfig.heroVideoPoster}
                    alt="Poster Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Video className="w-8 h-8 mb-1" />
                    <span className="text-xs">Tải ảnh Poster cho Video</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) =>
                    uploadImage(e, "heroVideoPoster", "Upload poster thành công")
                  }
                />
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all pointer-events-none">
                  <span className="text-white text-sm font-medium">Đổi ảnh Poster</span>
                </div>
              </div>
              {homepageConfig.heroVideoPoster && (
                <button
                  type="button"
                  onClick={() => removeImage("heroVideoPoster")}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 w-max"
                >
                  <Trash2 className="w-3 h-3" /> Xóa ảnh Poster
                </button>
              )}
            </div>
          </div>

          {/* Hero Side Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Ảnh Thành Phẩm / Xe Tải (Bên phải Hero chia chéo)
            </label>
            <div className="flex flex-col">
              <div className="relative w-full h-48 md:h-60 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 overflow-hidden group cursor-pointer bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                {homepageConfig.heroSideImage ? (
                  <img
                    src={homepageConfig.heroSideImage}
                    alt="Side Image Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs">Tải ảnh thành phẩm bên phải</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) =>
                    uploadImage(e, "heroSideImage", "Upload ảnh thành công")
                  }
                />
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all pointer-events-none">
                  <span className="text-white text-sm font-medium">Đổi ảnh</span>
                </div>
              </div>
              {homepageConfig.heroSideImage && (
                <button
                  type="button"
                  onClick={() => removeImage("heroSideImage")}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 w-max"
                >
                  <Trash2 className="w-3 h-3" /> Xóa ảnh
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Intro Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-2">
          Đoạn Giới Thiệu (Intro Section)
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tiêu đề Giới thiệu
            </label>
            <input
              type="text"
              name="introTitle"
              value={homepageConfig.introTitle || ""}
              onChange={handleHomepageChange}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Nội dung Giới thiệu
            </label>
            <textarea
              name="introDescription"
              value={homepageConfig.introDescription || ""}
              onChange={handleHomepageChange}
              rows={4}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
