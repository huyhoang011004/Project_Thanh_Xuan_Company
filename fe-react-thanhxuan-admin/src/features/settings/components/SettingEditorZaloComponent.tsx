// Adhering to SOLID & Design Patterns
"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Key, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { apiClient } from "@/services/api.service";

interface ZaloConfigState {
  appId: string;
  secretKey: string;
  oaId: string;
  accessToken: string;
  refreshToken: string;
  isConfigured: boolean;
}

export function SettingEditorZaloComponent() {
  const [config, setConfig] = useState<ZaloConfigState>({
    appId: "",
    secretKey: "",
    oaId: "",
    accessToken: "",
    refreshToken: "",
    isConfigured: false,
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchConfig = async () => {
    try {
      const data = await apiClient.get<Partial<ZaloConfigState>>("/zalo/config", true, { cache: "no-store" });
      if (data && typeof data === "object") {
        setConfig((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await apiClient.put("/zalo/config", config, true);
      setMsg({ type: "success", text: "Đã lưu cài đặt kết nối Zalo OA thành công!" });
      fetchConfig();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setMsg({ type: "error", text: errorObj.message || "Lỗi khi lưu cài đặt Zalo OA" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-blue-600" /> Tích hợp & Cấu hình Zalo OA (Zalo Cloud)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Kết nối tài khoản Zalo Official Account, quản lý API Access/Refresh Token và Webhook Realtime
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 text-sm font-medium ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
            <Key className="w-5 h-5 text-blue-600" /> Thông số Ứng dụng Zalo (App Credentials)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Zalo App ID</label>
              <input
                type="text"
                placeholder="Nhập Zalo App ID..."
                value={config.appId}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Zalo App Secret Key</label>
              <input
                type="password"
                placeholder="Nhập App Secret Key..."
                value={config.secretKey}
                onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Zalo Official Account ID (OA ID)</label>
            <input
              type="text"
              placeholder="Nhập OA ID từ trang quản trị Zalo OA..."
              value={config.oaId}
              onChange={(e) => setConfig({ ...config, oaId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Access Token (Tùy chọn nhập thủ công hoặc lấy tự động)</label>
            <textarea
              rows={2}
              placeholder="Zalo OA Access Token..."
              value={config.accessToken}
              onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm font-mono text-xs"
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2 border border-gray-100 dark:border-slate-800">
          <div className="text-xs font-bold text-gray-900 dark:text-white">URL Webhook Callback Zalo OA</div>
          <div className="text-xs font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 select-all">
            https://laundryexpress.com/api/v1/zalo/webhook
          </div>
          <p className="text-[11px] text-gray-500">
            Dán URL này vào mục Webhook Event Listener trên Zalo Developers Portal để tự động đồng bộ trạng thái khách hàng Follow/Unfollow Zalo OA.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/20 hover:opacity-95 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Lưu Cấu Hình Zalo OA"}
          </button>
        </div>
      </form>
    </div>
  );
}
