"use client";


import { Save, Loader2 } from "lucide-react";
import { useAdminSettings } from "../useAdminSettings";
import { HomeHeroFormSection } from "./home/HomeHeroFormSection";
import { HomeWhyChooseUsFormSection } from "./home/HomeWhyChooseUsFormSection";
import { HomeFaqFormSection } from "./home/HomeFaqFormSection";

export default function SettingEditorHomeComponent() {
  const {
    formData,
    isLoading,
    isSaving,
    message,
    handleHomepageChange,
    handleWhyChooseUsItemChange,
    addWhyChooseUsItem,
    removeWhyChooseUsItem,
    handleFaqChange,
    addFaq,
    removeFaq,
    handleSubmit,
  } = useAdminSettings();

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const homepageConfig = formData.homepageConfig || {};

  return (
    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 max-w-4xl mx-auto mb-12">
      {message && (
        <div
          className={`p-4 rounded-xl mb-6 font-medium ${
            message.includes("thành công")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        <HomeHeroFormSection
          homepageConfig={homepageConfig}
          handleHomepageChange={handleHomepageChange}
        />

        <HomeWhyChooseUsFormSection
          homepageConfig={homepageConfig}
          handleHomepageChange={handleHomepageChange}
          handleWhyChooseUsItemChange={handleWhyChooseUsItemChange}
          addWhyChooseUsItem={addWhyChooseUsItem}
          removeWhyChooseUsItem={removeWhyChooseUsItem}
        />

        <HomeFaqFormSection
          homepageConfig={homepageConfig}
          handleFaqChange={handleFaqChange}
          addFaq={addFaq}
          removeFaq={removeFaq}
        />

        <div className="flex justify-end pt-6 sticky bottom-4 bg-white/80 dark:bg-slate-900 backdrop-blur py-4 -mx-8 px-8 border-t z-10">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
