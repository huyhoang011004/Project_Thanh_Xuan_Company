"use client";


import { Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { IAdminSettings, IFooterConfig } from "../../admin-settings.types";

interface Props {
  formData: IAdminSettings;
  footerConfig: IFooterConfig;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleFooterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export function FooterCompanyInfoFormSection({
  formData,
  footerConfig,
  handleChange,
  handleFooterChange,
}: Props) {
  const handleMapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; message?: string };
      if (res.ok && data.url) {
        handleFooterChange({
          target: { name: "mapImageUrl", value: data.url },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
        toast.success("Cập nhật ảnh bản đồ thành công");
      } else {
        toast.error("Lỗi upload: " + (data.message || "Không xác định"));
      }
    } catch {
      toast.error("Lỗi upload ảnh bản đồ");
    }
    e.target.value = "";
  };

  const removeMapImage = (e: React.MouseEvent) => {
    e.preventDefault();
    handleFooterChange({
      target: { name: "mapImageUrl", value: "" },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Mô tả công ty
        </label>
        <textarea
          name="companyDescription"
          value={footerConfig.companyDescription || ""}
          onChange={handleFooterChange}
          rows={3}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Link Facebook
          </label>
          <input
            type="text"
            name="facebookLink"
            value={formData.facebookLink || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Link Messenger
          </label>
          <input
            type="text"
            name="messengerLink"
            value={formData.messengerLink || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Link Zalo
          </label>
          <input
            type="text"
            name="zaloLink"
            value={formData.zaloLink || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Thông tin Liên hệ */}
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Thông tin Liên hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tiêu đề cột Liên hệ (VD: Liên hệ)
            </label>
            <input
              type="text"
              name="contactTitle"
              value={footerConfig.contactTitle || ""}
              onChange={handleFooterChange}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Hotline
            </label>
            <input
              type="text"
              name="hotline"
              value={formData.hotline || ""}
              onChange={handleChange}
              placeholder="VD: 1800 54 54 83"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="VD: contact@thanhxuan.vn"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="VD: Số 16, Ngõ 81, Đường Vạn Phúc, Quận Hà Đông, Hà Nội"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Google Maps Link (Hoặc link iframe nhúng bản đồ)
            </label>
            <input
              type="text"
              name="googleMapsLink"
              value={formData.googleMapsLink || ""}
              onChange={handleChange}
              placeholder="Nhập link Google Maps"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Ảnh Bản đồ (Map Image)
              </label>
              <div className="relative w-full h-48 md:h-64 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 overflow-hidden group cursor-pointer bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center">
                {footerConfig.mapImageUrl ? (
                  <img
                    src={footerConfig.mapImageUrl}
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
                  onChange={handleMapUpload}
                />
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all pointer-events-none">
                  <span className="text-white text-sm font-medium">Đổi ảnh</span>
                </div>
              </div>
              {footerConfig.mapImageUrl && (
                <button
                  type="button"
                  onClick={removeMapImage}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 w-max"
                >
                  <Trash2 className="w-3 h-3" /> Xóa ảnh
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
