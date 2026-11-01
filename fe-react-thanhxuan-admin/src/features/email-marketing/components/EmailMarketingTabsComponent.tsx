// Adhering to SOLID & Design Patterns
import { Send, Workflow } from "lucide-react";

interface EmailMarketingTabsComponentProps {
  activeTab: "campaigns" | "sequences";
  setActiveTab: (tab: "campaigns" | "sequences") => void;
  campaignsCount: number;
  sequencesCount: number;
}

export function EmailMarketingTabsComponent({
  activeTab,
  setActiveTab,
  campaignsCount,
  sequencesCount,
}: EmailMarketingTabsComponentProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-slate-800 gap-6">
      <button
        onClick={() => setActiveTab("campaigns")}
        className={`pb-3 font-semibold text-sm transition relative flex items-center gap-2 ${
          activeTab === "campaigns"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        }`}
      >
        <Send className="w-4 h-4" /> Chiến dịch Email (Campaigns) ({campaignsCount})
      </button>
      <button
        onClick={() => setActiveTab("sequences")}
        className={`pb-3 font-semibold text-sm transition relative flex items-center gap-2 ${
          activeTab === "sequences"
            ? "text-emerald-600 border-b-2 border-emerald-600"
            : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        }`}
      >
        <Workflow className="w-4 h-4" /> Kịch bản tự động (Sequences) ({sequencesCount})
      </button>
    </div>
  );
}
