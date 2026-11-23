"use client";


import type { IFooterConfig } from "../../admin-settings.types";

interface Props {
  footerConfig: IFooterConfig;
  handleFooterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export function FooterBottomBarFormSection({
  footerConfig,
  handleFooterChange,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-slate-800">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Bản quyền (Copyright)
        </label>
        <input
          type="text"
          name="copyrightText"
          value={footerConfig.copyrightText || ""}
          onChange={handleFooterChange}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Chữ Chính sách bảo mật
        </label>
        <input
          type="text"
          name="policyText"
          value={footerConfig.policyText || ""}
          onChange={handleFooterChange}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Link Chính sách bảo mật
        </label>
        <input
          type="text"
          name="policyLink"
          value={footerConfig.policyLink || ""}
          onChange={handleFooterChange}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Chữ Điều khoản sử dụng
        </label>
        <input
          type="text"
          name="termsText"
          value={footerConfig.termsText || ""}
          onChange={handleFooterChange}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Link Điều khoản sử dụng
        </label>
        <input
          type="text"
          name="termsLink"
          value={footerConfig.termsLink || ""}
          onChange={handleFooterChange}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
    </div>
  );
}
