"use client";


import { Plus, Trash2 } from "lucide-react";
import type { IHomepageConfig, IFaqItem } from "../../admin-settings.types";

interface Props {
  homepageConfig: IHomepageConfig;
  handleFaqChange: (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => void;
  addFaq: () => void;
  removeFaq: (index: number) => void;
}

export function HomeFaqFormSection({
  homepageConfig,
  handleFaqChange,
  addFaq,
  removeFaq,
}: Props) {
  const faqs = homepageConfig.faqs || [];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-2">
        Câu hỏi thường gặp (FAQ)
      </h2>
      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            Danh sách FAQ
          </span>
          <button
            type="button"
            onClick={addFaq}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Thêm câu hỏi
          </button>
        </div>
        <div className="space-y-4">
          {faqs.map((faq: IFaqItem, index: number) => (
            <div
              key={index}
              className="flex gap-3 items-start bg-white dark:bg-slate-900/50 backdrop-blur-md p-3 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm"
            >
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Câu hỏi?"
                  value={faq.question}
                  onChange={(e) =>
                    handleFaqChange(index, "question", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
                <textarea
                  placeholder="Câu trả lời..."
                  value={faq.answer}
                  onChange={(e) =>
                    handleFaqChange(index, "answer", e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 dark:text-gray-300"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFaq(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded mt-1"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {faqs.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Chưa có câu hỏi nào
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
