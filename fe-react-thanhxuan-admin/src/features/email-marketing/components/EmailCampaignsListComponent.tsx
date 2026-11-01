// Adhering to SOLID & Design Patterns
import { Send } from "lucide-react";
import { EmailCampaign } from "../admin-email.types";

interface EmailCampaignsListComponentProps {
  loading: boolean;
  campaigns: EmailCampaign[];
  onExecuteCampaign: (id: string) => void;
}

export function EmailCampaignsListComponent({
  loading,
  campaigns,
  onExecuteCampaign,
}: EmailCampaignsListComponentProps) {
  if (loading) {
    return <p className="text-gray-500">Đang tải danh sách chiến dịch...</p>;
  }

  if (campaigns.length === 0) {
    return (
      <p className="text-gray-500 bg-white dark:bg-slate-900 p-8 rounded-xl text-center border border-gray-100 dark:border-slate-800">
        Chưa có chiến dịch Email nào được tạo.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((c) => (
        <div
          key={c._id}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                  c.status === "completed"
                    ? "bg-green-50 text-green-700"
                    : c.status === "running"
                    ? "bg-orange-50 text-orange-700"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}
              >
                {c.status}
              </span>
              <span className="text-xs text-gray-400">
                Tag: {c.targetTag || "Tất cả"}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {c.name}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 border-l-2 border-gray-200 pl-3">
              <span className="font-semibold text-xs text-gray-500 block mb-1">
                Tiêu đề:
              </span>
              {c.subject}
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500">
            <div>
              Đã gửi:{" "}
              <strong className="text-gray-900 dark:text-white">
                {c.sentCount || 0}
              </strong>{" "}
              / {c.totalRecipients || 0}
            </div>
            {c.status === "draft" && (
              <button
                onClick={() => onExecuteCampaign(c._id)}
                className="flex items-center gap-1 text-blue-600 font-semibold hover:underline"
              >
                <Send className="w-3.5 h-3.5" /> Gửi ngay
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
