"use client";


import { Plus, Trash2 } from "lucide-react";
import type { IServiceConfig } from "../../admin-settings.types";

interface Props {
  serviceConfig: IServiceConfig;
  handleServiceChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } },
  ) => void;
  handleWorkProcessItemChange: (
    index: number,
    field: "title" | "description",
    value: string,
  ) => void;
  addWorkProcessItem: () => void;
  removeWorkProcessItem: (index: number) => void;
}

export function ServiceWorkProcessFormSection({
  serviceConfig,
  handleServiceChange,
  handleWorkProcessItemChange,
  addWorkProcessItem,
  removeWorkProcessItem,
}: Props) {
  const workProcessItems = serviceConfig.workProcessItems || [];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-2">
        Quy trình làm việc (Work Process)
      </h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              name="workProcessTitle"
              value={serviceConfig.workProcessTitle || ""}
              onChange={handleServiceChange}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Lời dẫn
            </label>
            <input
              type="text"
              name="workProcessSubtitle"
              value={serviceConfig.workProcessSubtitle || ""}
              onChange={handleServiceChange}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              Các bước (Tối đa 3 bước)
            </span>
            {workProcessItems.length < 3 && (
              <button
                type="button"
                onClick={addWorkProcessItem}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-4 h-4" /> Thêm bước
              </button>
            )}
          </div>
          <div className="space-y-4">
            {workProcessItems.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 items-start bg-white dark:bg-slate-900/50 backdrop-blur-md p-3 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm"
              >
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    placeholder={`Tiêu đề Bước ${index + 1}`}
                    value={item.title}
                    onChange={(e) =>
                      handleWorkProcessItemChange(
                        index,
                        "title",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                  <textarea
                    placeholder="Mô tả"
                    value={item.description}
                    onChange={(e) =>
                      handleWorkProcessItemChange(
                        index,
                        "description",
                        e.target.value,
                      )
                    }
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 dark:text-gray-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeWorkProcessItem(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded mt-1"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {workProcessItems.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Chưa có bước nào
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
