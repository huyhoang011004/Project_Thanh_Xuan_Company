"use client";


import { Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { IVesinhConfig } from "../../admin-settings.types";

interface Props {
  vesinhConfig: IVesinhConfig;
  handleVesinhChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export function VesinhHeroFormSection({
  vesinhConfig,
  handleVesinhChange,
}: Props) {
  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "heroBannerImage" | "whyChooseUsImage",
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
        handleVesinhChange({
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

  const removeImage = (field: "heroBannerImage" | "whyChooseUsImage") => {
    handleVesinhChange({
      target: { name: field, value: "" },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
    toast.success("Đã gỡ ảnh");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b pb-3">
        1. Phần Đầu Trang (Hero & Giới Thiệu Vệ Sinh)
      </h3>

      {/* Ảnh Banner / Showcase Nửa Phải */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Ảnh Showcase Vệ Sinh (Nửa bên phải)
        </label>
        {vesinhConfig.heroBannerImage ? (
          <div className="relative w-full max-w-md h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 mb-3 group">
            <img
              src={vesinhConfig.heroBannerImage}
              alt="Hero Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage("heroBannerImage")}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 mb-2 italic">
            Đang dùng ảnh mặc định (/images/services-hero.webp)
          </p>
        )}
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl cursor-pointer text-sm font-medium transition-colors">
          <ImageIcon className="w-4 h-4" />
          <span>Tải ảnh mới</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => uploadImage(e, "heroBannerImage", "Đã tải ảnh banner lên!")}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tiêu đề chính */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Tiêu đề Hero (H1 SEO)
          </label>
          <input
            type="text"
            name="heroTitle"
            value={vesinhConfig.heroTitle || ""}
            onChange={handleVesinhChange}
            placeholder="Mặc định: Giải Pháp Vệ Sinh Công Nghiệp & Tòa Nhà Trọn Gói..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Hotline riêng */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Số Hotline Tư Vấn Khảo Sát
          </label>
          <input
            type="text"
            name="hotline"
            value={vesinhConfig.hotline || ""}
            onChange={handleVesinhChange}
            placeholder="Mặc định lấy từ cài đặt chung: 0968 54 54 83"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Mô tả phụ */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Mô tả phụ Hero
        </label>
        <textarea
          name="heroSubtitle"
          rows={2}
          value={vesinhConfig.heroSubtitle || ""}
          onChange={handleVesinhChange}
          placeholder="Mặc định: Chuyên gia vệ sinh văn phòng, nhà hàng, giặt thảm văn phòng, giặt ghế sofa..."
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Intro Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Tiêu đề khối Năng Lực Vệ Sinh
          </label>
          <input
            type="text"
            name="introTitle"
            value={vesinhConfig.introTitle || ""}
            onChange={handleVesinhChange}
            placeholder="Mặc định: Đối Tác Vệ Sinh Đáng Tin Cậy Của Các Doanh Nghiệp Tại Hà Nội"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Mô tả khối Năng Lực Vệ Sinh
          </label>
          <textarea
            name="introDescription"
            rows={2}
            value={vesinhConfig.introDescription || ""}
            onChange={handleVesinhChange}
            placeholder="Mặc định: Thanh Xuân mang đến giải pháp làm sạch toàn diện và chuyên sâu..."
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
