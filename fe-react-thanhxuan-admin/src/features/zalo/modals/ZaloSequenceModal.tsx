"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { apiClient } from "@/services/api.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ZaloSequenceModal({ isOpen, onClose, onSuccess }: Props) {
  const [sequenceData, setSequenceData] = useState({
    name: "",
    description: "",
    trigger: "on_follow_oa",
    messageContent: "",
    delayDays: 0,
  });

  if (!isOpen) return null;

  const handleCreateSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: sequenceData.name,
        description: sequenceData.description,
        trigger: sequenceData.trigger,
        steps: [
          {
            stepOrder: 1,
            delayDays: sequenceData.delayDays,
            messageContent: sequenceData.messageContent,
          },
        ],
      };
      await apiClient.post("/zalo-marketing/sequences", payload, true);
      onClose();
      setSequenceData({
        name: "",
        description: "",
        trigger: "on_follow_oa",
        messageContent: "",
        delayDays: 0,
      });
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Tạo Chuỗi CSKH Tự Động Zalo
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreateSequence} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên Chuỗi kịch bản
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Chào mừng khách mới Follow Zalo OA"
              value={sequenceData.name}
              onChange={(e) =>
                setSequenceData({ ...sequenceData, name: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Điều kiện Trigger
              </label>
              <select
                value={sequenceData.trigger}
                onChange={(e) =>
                  setSequenceData({ ...sequenceData, trigger: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              >
                <option value="on_follow_oa">Khách vừa Follow Zalo OA</option>
                <option value="after_order">Sau khi hoàn thành đơn giặt</option>
                <option value="inactive_customer">
                  Sau 30 ngày chưa giặt lại
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số ngày trễ (Delay)
              </label>
              <input
                type="number"
                value={sequenceData.delayDays}
                onChange={(e) =>
                  setSequenceData({
                    ...sequenceData,
                    delayDays: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nội dung tin nhắn tự động
            </label>
            <textarea
              required
              rows={3}
              placeholder="Cảm ơn quý khách đã quan tâm Zalo OA Laundry Express Thanh Xuân..."
              value={sequenceData.messageContent}
              onChange={(e) =>
                setSequenceData({
                  ...sequenceData,
                  messageContent: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
            >
              Lưu kịch bản tự động
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
