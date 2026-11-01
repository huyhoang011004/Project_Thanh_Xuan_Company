// Adhering to SOLID & Design Patterns
import React from "react";
import { X } from "lucide-react";
import { SequenceFormData } from "../admin-email.types";

interface EmailSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequenceData: SequenceFormData;
  setSequenceData: React.Dispatch<React.SetStateAction<SequenceFormData>>;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmailSequenceModal({
  isOpen,
  onClose,
  sequenceData,
  setSequenceData,
  onSubmit,
}: EmailSequenceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Thiết Lập Kịch Bản Tự Động (Sequences)
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên Kịch bản
            </label>
            <input
              type="text"
              required
              placeholder="VD: Chuỗi chào mừng khách mới"
              value={sequenceData.name}
              onChange={(e) =>
                setSequenceData({ ...sequenceData, name: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Điều kiện kích hoạt (Trigger)
              </label>
              <select
                value={sequenceData.trigger}
                onChange={(e) =>
                  setSequenceData({ ...sequenceData, trigger: e.target.value as any })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="on_subscribe">Khách hàng mới (Đăng ký)</option>
                <option value="after_order">Sau khi hoàn thành đơn giặt</option>
                <option value="inactive_customer">Không tương tác (30 ngày)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Độ trễ gửi thư (Ngày)
              </label>
              <input
                type="number"
                min="0"
                required
                value={sequenceData.delayDays}
                onChange={(e) =>
                  setSequenceData({ ...sequenceData, delayDays: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Cấu hình Email tự động
            </h4>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tiêu đề (Subject)
              </label>
              <input
                type="text"
                required
                placeholder="Chào mừng bạn đến với Laundry Express!"
                value={sequenceData.subject}
                onChange={(e) =>
                  setSequenceData({ ...sequenceData, subject: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-white/5 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nội dung HTML (Body)
              </label>
              <textarea
                required
                rows={4}
                placeholder="Nội dung HTML của thư chào mừng..."
                value={sequenceData.htmlContent}
                onChange={(e) =>
                  setSequenceData({ ...sequenceData, htmlContent: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-white/5 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
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
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              Tạo kịch bản
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
