"use client";


import { Plus, Trash2 } from "lucide-react";
import type { IVesinhConfig } from "../../admin-settings.types";

interface Props {
  vesinhConfig: IVesinhConfig;
  handleVesinhFaqChange: (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => void;
  addVesinhFaq: () => void;
  removeVesinhFaq: (index: number) => void;
}

export function VesinhFaqFormSection({
  vesinhConfig,
  handleVesinhFaqChange,
  addVesinhFaq,
  removeVesinhFaq,
}: Props) {
  const faqs = vesinhConfig.faqs || [];

  return (
    <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-slate-800">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            3. Câu Hỏi Thường Gặp (FAQ Vệ Sinh)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Các câu hỏi xuất hiện tại khối accordion giải đáp thắc mắc cuối trang
          </p>
        </div>
        <button
          type="button"
          onClick={addVesinhFaq}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm câu hỏi FAQ</span>
        </button>
      </div>

      {faqs.length === 0 ? (
        <p className="text-xs text-gray-500 italic p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
          Đang hiển thị 6 câu hỏi FAQ chuyên sâu mặc định (Khảo sát 0đ, Thi công ban đêm, Hóa chất an toàn, Thời gian khô thảm, Hóa đơn VAT, Bảo hành). Bấm &quot;Thêm câu hỏi FAQ&quot; để thiết lập danh sách riêng.
        </p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Câu hỏi #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeVesinhFaq(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) =>
                    handleVesinhFaqChange(index, "question", e.target.value)
                  }
                  placeholder="Ví dụ: Chi phí khảo sát dịch vụ vệ sinh tận nơi là bao nhiêu?"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  value={faq.answer}
                  onChange={(e) =>
                    handleVesinhFaqChange(index, "answer", e.target.value)
                  }
                  placeholder="Câu trả lời chi tiết..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
