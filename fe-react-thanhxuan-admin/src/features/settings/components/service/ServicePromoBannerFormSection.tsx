"use client";


import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { IServiceConfig } from "../../admin-settings.types";

interface Props {
  serviceConfig: IServiceConfig;
  handlePromoBannerChange: (
    index: number,
    field: string,
    value: string,
  ) => void;
  addPromoBanner: () => void;
  removePromoBanner: (index: number) => void;
}

export function ServicePromoBannerFormSection({
  serviceConfig,
  handlePromoBannerChange,
  addPromoBanner,
  removePromoBanner,
}: Props) {
  const promoBanners = serviceConfig.promoBanners || [];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-2">
        Banner Khuyến mãi (Promo Banners)
      </h2>
      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            Danh sách Banner (Tối đa 2 banner)
          </span>
          {promoBanners.length < 2 && (
            <button
              type="button"
              onClick={addPromoBanner}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Thêm Banner
            </button>
          )}
        </div>
        <div className="space-y-6">
          {promoBanners.map((banner, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900/50 backdrop-blur-md p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm space-y-4 relative"
            >
              <button
                type="button"
                onClick={() => removePromoBanner(index)}
                className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Banner #{index + 1}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Tiêu đề (Title)
                  </label>
                  <input
                    type="text"
                    value={banner.title}
                    onChange={(e) =>
                      handlePromoBannerChange(index, "title", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Link liên kết nút (Button Link)
                  </label>
                  <input
                    type="text"
                    value={banner.buttonLink}
                    onChange={(e) =>
                      handlePromoBannerChange(
                        index,
                        "buttonLink",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Mô tả (Description)
                  </label>
                  <textarea
                    value={banner.description}
                    onChange={(e) =>
                      handlePromoBannerChange(
                        index,
                        "description",
                        e.target.value,
                      )
                    }
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Text nút bấm (Button Text)
                  </label>
                  <input
                    type="text"
                    value={banner.buttonText}
                    onChange={(e) =>
                      handlePromoBannerChange(
                        index,
                        "buttonText",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Ảnh Nền Banner
                  </label>
                  <div className="flex flex-col">
                    <div className="relative w-full h-48 md:h-64 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 overflow-hidden group cursor-pointer bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-xs">Thêm ảnh</span>
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
                              handlePromoBannerChange(
                                index,
                                "image",
                                data.url,
                              );
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
                        <span className="text-white text-sm font-medium">
                          Đổi ảnh
                        </span>
                      </div>
                    </div>
                    {banner.image && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePromoBannerChange(index, "image", "");
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
          ))}
          {promoBanners.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Chưa có banner nào
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
