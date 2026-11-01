"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { apiClient } from "@/services/api.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ZaloCampaignModal({ isOpen, onClose, onSuccess }: Props) {
  const [campaignData, setCampaignData] = useState({
    name: "",
    description: "",
    messageContent: "",
    targetTag: "tat-ca",
    targetZaloFollowersOnly: false,
  });

  if (!isOpen) return null;

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/zalo-marketing/campaigns", campaignData, true);
      onClose();
      setCampaignData({
        name: "",
        description: "",
        messageContent: "",
        targetTag: "tat-ca",
        targetZaloFollowersOnly: false,
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
            Tạo Chiến Dịch Zalo Marketing Mới
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên Chiến dịch
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Ưu đãi Giặt Chăn Mền Cuối Tuần"
              value={campaignData.name}
              onChange={(e) =>
                setCampaignData({ ...campaignData, name: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nội dung Tin nhắn
            </label>
            <textarea
              required
              rows={4}
              placeholder="Nhập nội dung quảng cáo / ưu đãi tới khách hàng..."
              value={campaignData.messageContent}
              onChange={(e) =>
                setCampaignData({
                  ...campaignData,
                  messageContent: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phân tệp Khách hàng (Tag)
            </label>
            <select
              value={campaignData.targetTag}
              onChange={(e) =>
                setCampaignData({ ...campaignData, targetTag: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
            >
              <option value="tat-ca">Tất cả khách hàng trong CRM</option>
              <option value="khach-moi">Khách hàng mới</option>
              <option value="vip">Khách hàng VIP</option>
              <option value="giat-say">Khách hay giặt sấy quần áo</option>
            </select>
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
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Tạo chiến dịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
