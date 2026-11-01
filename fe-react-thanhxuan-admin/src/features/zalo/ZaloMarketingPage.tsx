// Adhering to SOLID & Design Patterns
"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Plus } from "lucide-react";
import { apiClient } from "@/services/api.service";
import type {
  IZaloCampaign,
  IZaloSequence,
} from "./types/zalo-marketing.types";
import { ZaloCampaignModal } from "./modals/ZaloCampaignModal";
import { ZaloSequenceModal } from "./modals/ZaloSequenceModal";

export function ZaloMarketingPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "sequences">(
    "campaigns",
  );

  const [campaigns, setCampaigns] = useState<IZaloCampaign[]>([]);
  const [sequences, setSequences] = useState<IZaloSequence[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "campaigns") {
        const data = await apiClient.get<IZaloCampaign[]>(
          "/zalo-marketing/campaigns",
          true,
          { cache: "no-store" },
        );
        setCampaigns(Array.isArray(data) ? data : []);
      } else {
        const data = await apiClient.get<IZaloSequence[]>(
          "/zalo-marketing/sequences",
          true,
          { cache: "no-store" },
        );
        setSequences(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleExecuteCampaign = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn thực thi chiến dịch tin nhắn này?"))
      return;
    try {
      await apiClient.post(
        `/zalo-marketing/campaigns/${id}/execute`,
        {},
        true,
      );
      alert("Đã hoàn thành thực thi chiến dịch!");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-blue-600" /> Quản lý Chiến
            dịch & Automation Zalo
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tạo chiến dịch tin nhắn Zalo MKT và thiết lập chuỗi CSKH tự động
            theo tuần/tháng
          </p>
        </div>
        <div>
          {activeTab === "campaigns" ? (
            <button
              onClick={() => setIsCampaignModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/20 hover:opacity-95 transition"
            >
              <Plus className="w-5 h-5" /> Tạo chiến dịch MKT mới
            </button>
          ) : (
            <button
              onClick={() => setIsSequenceModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md shadow-emerald-500/20 hover:opacity-95 transition"
            >
              <Plus className="w-5 h-5" /> Tạo chuỗi CSKH tự động
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`pb-3 font-semibold text-sm transition relative ${
            activeTab === "campaigns"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          Chiến dịch Zalo MKT ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab("sequences")}
          className={`pb-3 font-semibold text-sm transition relative ${
            activeTab === "sequences"
              ? "text-emerald-600 border-b-2 border-emerald-600"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          Chuỗi CSKH Tự động (Automation) ({sequences.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "campaigns" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-gray-500 col-span-full">
              Đang tải danh sách chiến dịch...
            </p>
          ) : campaigns.length === 0 ? (
            <p className="text-gray-500 col-span-full">
              Chưa có chiến dịch MKT nào
            </p>
          ) : (
            campaigns.map((c) => (
              <div
                key={c._id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                      {c.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      Tag: {c.targetTag || "Tất cả"}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {c.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                    {c.messageContent}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500">
                  <div>
                    Đã gửi:{" "}
                    <strong className="text-gray-900 dark:text-white">
                      {c.sentCount || 0}
                    </strong>{" "}
                    / {c.totalRecipients || 0}
                  </div>
                  {c.status !== "completed" && (
                    <button
                      onClick={() => handleExecuteCampaign(c._id)}
                      className="flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                    >
                      <Send className="w-3.5 h-3.5" /> Gửi ngay
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <p className="text-gray-500 col-span-full">
              Đang tải danh sách chuỗi CSKH...
            </p>
          ) : sequences.length === 0 ? (
            <p className="text-gray-500 col-span-full">
              Chưa có chuỗi CSKH tự động nào
            </p>
          ) : (
            sequences.map((s) => (
              <div
                key={s._id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {s.name}
                  </h3>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Đang hoạt động
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Trigger: <strong>{s.trigger}</strong>
                </p>
                <div className="space-y-2 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  {s.steps?.map((st, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-gray-700 dark:text-gray-300"
                    >
                      <strong>
                        Bước {st.stepOrder} (Trễ {st.delayDays} ngày):
                      </strong>{" "}
                      {st.messageContent}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ZaloCampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onSuccess={fetchData}
      />

      <ZaloSequenceModal
        isOpen={isSequenceModalOpen}
        onClose={() => setIsSequenceModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
