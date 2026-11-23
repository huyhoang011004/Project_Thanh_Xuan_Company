"use client";


import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type {
  IHomepageConfig,
  IWhyChooseUsItem,
} from "../../admin-settings.types";

interface Props {
  homepageConfig: IHomepageConfig;
  handleHomepageChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleWhyChooseUsItemChange: (
    index: number,
    field: "title" | "description",
    value: string,
  ) => void;
  addWhyChooseUsItem: () => void;
  removeWhyChooseUsItem: (index: number) => void;
}

export function HomeWhyChooseUsFormSection({
  homepageConfig,
  handleHomepageChange,
  handleWhyChooseUsItemChange,
  addWhyChooseUsItem,
  removeWhyChooseUsItem,
}: Props) {
  const whyChooseUsItems = homepageConfig.whyChooseUsItems || [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { success?: boolean; url?: string; message?: string };
      if (data.success && data.url) {
        handleHomepageChange({
          target: { name: "whyChooseUsImage", value: data.url },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
        toast.success("Upload ảnh thành công");
      } else {
        toast.error("Lỗi upload: " + (data.message || "Không xác định"));
      }
    } catch {
      toast.error("Lỗi upload ảnh");
    }
    e.target.value = "";
  };

  const removeImage = () => {
    handleHomepageChange({
      target: { name: "whyChooseUsImage", value: "" },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-2">
        Tại sao chọn chúng tôi (Why Choose Us)
      </h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tiêu đề chính
            </label>
            <input
              type="text"
              name="whyChooseUsTitle"
              value={homepageConfig.whyChooseUsTitle || ""}
              onChange={handleHomepageChange}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Ảnh minh họa (Tại sao chọn chúng tôi)
            </label>
            <div className="flex flex-col">
              <div className="relative w-full h-48 md:h-64 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 overflow-hidden group cursor-pointer bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                {homepageConfig.whyChooseUsImage ? (
                  <img
                    src={homepageConfig.whyChooseUsImage}
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
                  onChange={handleImageUpload}
                />
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all pointer-events-none">
                  <span className="text-white text-sm font-medium">Đổi ảnh</span>
                </div>
              </div>
              {homepageConfig.whyChooseUsImage && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 w-max"
                >
                  <Trash2 className="w-3 h-3" /> Xóa ảnh
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Mô tả ngắn
          </label>
          <textarea
            name="whyChooseUsDescription"
            value={homepageConfig.whyChooseUsDescription || ""}
            onChange={handleHomepageChange}
            rows={2}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              Danh sách Lý do
            </span>
            <button
              type="button"
              onClick={addWhyChooseUsItem}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Thêm lý do
            </button>
          </div>
          <div className="space-y-4">
            {whyChooseUsItems.map((item: IWhyChooseUsItem, index: number) => (
              <div
                key={index}
                className="flex gap-3 items-start bg-white dark:bg-slate-900/50 backdrop-blur-md p-3 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm"
              >
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    placeholder="Tiêu đề (VD: Công nghệ hiện đại)"
                    value={item.title}
                    onChange={(e) =>
                      handleWhyChooseUsItemChange(index, "title", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                  <textarea
                    placeholder="Mô tả chi tiết"
                    value={item.description}
                    onChange={(e) =>
                      handleWhyChooseUsItemChange(
                        index,
                        "description",
                        e.target.value,
                      )
                    }
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 dark:text-gray-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeWhyChooseUsItem(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded mt-1"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {whyChooseUsItems.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Chưa có lý do nào
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
