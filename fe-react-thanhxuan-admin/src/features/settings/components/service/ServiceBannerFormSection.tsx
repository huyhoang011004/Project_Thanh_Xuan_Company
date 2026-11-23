"use client";


import { Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { IServiceConfig } from "../../admin-settings.types";

interface Props {
  serviceConfig: IServiceConfig;
  handleServiceChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } },
  ) => void;
}

export function ServiceBannerFormSection({
  serviceConfig,
  handleServiceChange,
}: Props) {
  return (
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-2">
          Bìa trang (Banner)
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tiêu đề chính
            </label>
            <input
              type="text"
              name="bannerTitle"
              value={serviceConfig.bannerTitle || ""}
              onChange={handleServiceChange}
              placeholder="VD: Giải Pháp Giặt Sấy & Vệ Sinh Toàn Diện"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Phụ đề
            </label>
            <textarea
              name="bannerSubtitle"
              value={serviceConfig.bannerSubtitle || ""}
              onChange={handleServiceChange}
              rows={2}
              placeholder="VD: Chất lượng vượt trội, an toàn sức khỏe..."
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Ảnh Nền (Background Image)
            </label>
            <div className="flex flex-col">
              <div className="relative w-full h-48 md:h-64 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 overflow-hidden group cursor-pointer bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                {serviceConfig.bannerImage ? (
                  <img
                    src={serviceConfig.bannerImage}
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
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("file", file);
                    try {
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: fd,
                      });
                      const data = (await res.json()) as {
                        success?: boolean;
                        url?: string;
                        message?: string;
                      };
                      if (data.success && data.url) {
                        handleServiceChange({
                          target: { name: "bannerImage", value: data.url },
                        });
                        toast.success("Upload ảnh thành công");
                      } else {
                        toast.error("Lỗi upload: " + (data.message || ""));
                      }
                    } catch {
                      toast.error("Lỗi upload ảnh");
                    }
                    e.target.value = "";
                  }}
                />
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all pointer-events-none">
                  <span className="text-white text-sm font-medium">Đổi ảnh</span>
                </div>
              </div>
              {serviceConfig.bannerImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleServiceChange({
                      target: { name: "bannerImage", value: "" },
                    });
                  }}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 w-max"
                >
                  <Trash2 className="w-3 h-3" /> Xóa ảnh
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-2">
          Danh sách Dịch vụ
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tiêu đề (VD: Dịch vụ của chúng tôi)
            </label>
            <input
              type="text"
              name="listTitle"
              value={serviceConfig.listTitle || ""}
              onChange={handleServiceChange}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Lời dẫn (Subtitle)
            </label>
            <textarea
              name="listSubtitle"
              value={serviceConfig.listSubtitle || ""}
              onChange={handleServiceChange}
              rows={2}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </>
  );
}
