// Adhering to SOLID & Design Patterns
import { EmailSequence } from "../admin-email.types";

interface EmailSequencesListComponentProps {
  loading: boolean;
  sequences: EmailSequence[];
}

export function EmailSequencesListComponent({
  loading,
  sequences,
}: EmailSequencesListComponentProps) {
  if (loading) {
    return <p className="text-gray-500">Đang tải kịch bản...</p>;
  }

  if (sequences.length === 0) {
    return (
      <p className="text-gray-500 bg-white dark:bg-slate-900 p-8 rounded-xl text-center border border-gray-100 dark:border-slate-800">
        Chưa có kịch bản Email tự động nào được cấu hình.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sequences.map((s) => (
        <div
          key={s._id}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {s.name}
            </h3>
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                s.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {s.isActive ? "Hoạt động" : "Tạm dừng"}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Kích hoạt: <strong>{s.trigger}</strong>
          </p>
          <div className="space-y-3 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50">
            {s.steps?.map((st: any, idx: number) => (
              <div key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  Bước {st.stepOrder} (Trễ {st.delayDays} ngày):
                </div>
                <div className="line-clamp-2">
                  <strong>Tiêu đề:</strong> {st.subject}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
