// Adhering to SOLID & Design Patterns
import React from "react";
import { X } from "lucide-react";
import { CampaignFormData } from "../admin-email.types";

interface EmailCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignData: CampaignFormData;
  setCampaignData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmailCampaignModal({
  isOpen,
  onClose,
  campaignData,
  setCampaignData,
  onSubmit,
}: EmailCampaignModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Tạo Chiến Dịch Email Marketing
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên Chiến dịch
              </label>
              <input
                type="text"
                required
                placeholder="VD: Tri ân cuối năm 2026"
                value={campaignData.name}
                onChange={(e) =>
                  setCampaignData({ ...campaignData, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phân tệp Khách hàng
              </label>
              <select
                value={campaignData.targetTag}
                onChange={(e) =>
                  setCampaignData({ ...campaignData, targetTag: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="tat-ca">Tất cả khách hàng (Có Email)</option>
                <option value="khach-moi">Khách hàng mới</option>
                <option value="vip">Khách hàng VIP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tiêu đề Email (Subject)
            </label>
            <input
              type="text"
              required
              placeholder="Giảm giá 50% dịch vụ giặt là cho khách hàng VIP!"
              value={campaignData.subject}
              onChange={(e) =>
                setCampaignData({ ...campaignData, subject: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nội dung HTML (Body)
            </label>
            <textarea
              required
              rows={6}
              placeholder="<h2>Xin chào,</h2><p>Cảm ơn quý khách đã tin dùng dịch vụ...</p>"
              value={campaignData.htmlContent}
              onChange={(e) =>
                setCampaignData({ ...campaignData, htmlContent: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">Hỗ trợ các thẻ HTML cơ bản.</p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Tạo chiến dịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
