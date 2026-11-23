"use client";


import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { IVesinhConfig } from "../../admin-settings.types";

interface Props {
  vesinhConfig: IVesinhConfig;
  handleVesinhChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleVesinhWhyChooseUsItemChange: (
    index: number,
    field: "title" | "description",
    value: string,
  ) => void;
  addVesinhWhyChooseUsItem: () => void;
  removeVesinhWhyChooseUsItem: (index: number) => void;
}

export function VesinhWhyChooseUsFormSection({
  vesinhConfig,
  handleVesinhChange,
  handleVesinhWhyChooseUsItemChange,
  addVesinhWhyChooseUsItem,
  removeVesinhWhyChooseUsItem,
}: Props) {
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { success?: boolean; url?: string; message?: string };
      if (data.success && data.url) {
        handleVesinhChange({
          target: { name: "whyChooseUsImage", value: data.url },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
        toast.success("Đã tải ảnh Lý Do Chọn lên!");
      } else {
        toast.error("Lỗi upload: " + (data.message || "Không xác định"));
      }
    } catch {
      toast.error("Lỗi upload ảnh");
    }
    e.target.value = "";
  };

  const items = vesinhConfig.whyChooseUsItems || [];

  return (
    <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-slate-800">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b pb-3">
        2. Phần &quot;Tại Sao Chọn Chúng Tôi&quot; (Khối Cam Kết B2B)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Tiêu đề khối
          </label>
          <input
            type="text"
            name="whyChooseUsTitle"
            value={vesinhConfig.whyChooseUsTitle || ""}
            onChange={handleVesinhChange}
            placeholder="Mặc định: Tiêu Chuẩn Làm Sạch Khác Biệt Cho Khách Hàng Doanh Nghiệp"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Mô tả ngắn
          </label>
          <input
            type="text"
            name="whyChooseUsDescription"
            value={vesinhConfig.whyChooseUsDescription || ""}
            onChange={handleVesinhChange}
            placeholder="Mô tả bổ sung nếu có..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Ảnh khối cam kết */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Ảnh Khối Cam Kết (Cột trái)
        </label>
        {vesinhConfig.whyChooseUsImage ? (
          <div className="relative w-full max-w-xs h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 mb-3 group">
            <img
              src={vesinhConfig.whyChooseUsImage}
              alt="Cam kết Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                handleVesinhChange({
                  target: { name: "whyChooseUsImage", value: "" },
                } as unknown as React.ChangeEvent<HTMLInputElement>);
                toast.success("Đã gỡ ảnh");
              }}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 mb-2 italic">
            Đang dùng ảnh mặc định (/images/why-choose-us.webp)
          </p>
        )}
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl cursor-pointer text-sm font-medium transition-colors">
          <ImageIcon className="w-4 h-4" />
          <span>Tải ảnh mới</span>
          <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
        </label>
      </div>

      {/* Danh sách các lý do / cam kết */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Danh Sách Cam Kết & Lợi Thế ({items.length} mục)
          </label>
          <button
            type="button"
            onClick={addVesinhWhyChooseUsItem}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm mục cam kết</span>
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-gray-500 italic p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
            Đang hiển thị 6 cam kết mặc định (Pháp nhân VAT, Bảo hiểm tài sản, Nhân sự xác thực, Máy móc chuẩn, Chiết khấu định kỳ, Hỗ trợ 24/7). Bấm &quot;Thêm mục cam kết&quot; để tùy biến theo ý quý khách.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700"
              >
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleVesinhWhyChooseUsItemChange(index, "title", e.target.value)
                    }
                    placeholder="Tiêu đề cam kết (ví dụ: Pháp Nhân & Hóa Đơn VAT Đầy Đủ)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium"
                  />
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) =>
                      handleVesinhWhyChooseUsItemChange(index, "description", e.target.value)
                    }
                    placeholder="Nội dung giải thích chi tiết..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVesinhWhyChooseUsItem(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
