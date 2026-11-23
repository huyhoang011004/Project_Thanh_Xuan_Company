"use client";


import { Save, Loader2, Sparkles } from "lucide-react";
import { useAdminSettings } from "../useAdminSettings";
import { VesinhHeroFormSection } from "./vesinh/VesinhHeroFormSection";
import { VesinhWhyChooseUsFormSection } from "./vesinh/VesinhWhyChooseUsFormSection";
import { VesinhFaqFormSection } from "./vesinh/VesinhFaqFormSection";

export function SettingEditorVesinhComponent() {
  const {
    formData,
    isLoading,
    isSaving,
    message,
    handleVesinhChange,
    handleVesinhWhyChooseUsItemChange,
    addVesinhWhyChooseUsItem,
    removeVesinhWhyChooseUsItem,
    handleVesinhFaqChange,
    addVesinhFaq,
    removeVesinhFaq,
    handleSubmit,
  } = useAdminSettings();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const vesinhConfig = formData.vesinhConfig || {};

  return (
    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 max-w-4xl mx-auto mb-12">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Cài Đặt Trang Đích Dịch Vụ Vệ Sinh
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Cấu hình nội dung hiển thị cho tuyến đường /vesinh và tên miền phụ vesinh.thanhxuanlaundry.com
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl mb-6 font-medium text-sm ${
            message.includes("thành công")
              ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <VesinhHeroFormSection
          vesinhConfig={vesinhConfig}
          handleVesinhChange={handleVesinhChange}
        />

        <VesinhWhyChooseUsFormSection
          vesinhConfig={vesinhConfig}
          handleVesinhChange={handleVesinhChange}
          handleVesinhWhyChooseUsItemChange={handleVesinhWhyChooseUsItemChange}
          addVesinhWhyChooseUsItem={addVesinhWhyChooseUsItem}
          removeVesinhWhyChooseUsItem={removeVesinhWhyChooseUsItem}
        />

        <VesinhFaqFormSection
          vesinhConfig={vesinhConfig}
          handleVesinhFaqChange={handleVesinhFaqChange}
          addVesinhFaq={addVesinhFaq}
          removeVesinhFaq={removeVesinhFaq}
        />

        <div className="flex justify-end pt-6 sticky bottom-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur py-4 -mx-8 px-8 border-t border-gray-100 dark:border-slate-800 z-10">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 text-sm"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Lưu cài đặt vệ sinh
          </button>
        </div>
      </form>
    </div>
  );
}
