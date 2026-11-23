"use client";


import { Plus, Trash2 } from "lucide-react";
import type { IFooterConfig, IFooterLink } from "../../admin-settings.types";

interface Props {
  footerConfig: IFooterConfig;
  handleFooterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleFooterLinksChange: (
    field: "servicesLinks" | "exploreLinks",
    newLinks: IFooterLink[],
  ) => void;
}

export function FooterLinksFormSection({
  footerConfig,
  handleFooterChange,
  handleFooterLinksChange,
}: Props) {
  const servicesLinks = footerConfig.servicesLinks || [];
  const exploreLinks = footerConfig.exploreLinks || [];

  const addServiceLink = () => {
    handleFooterLinksChange("servicesLinks", [
      ...servicesLinks,
      { label: "", url: "" },
    ]);
  };

  const removeServiceLink = (index: number) => {
    const newLinks = [...servicesLinks];
    newLinks.splice(index, 1);
    handleFooterLinksChange("servicesLinks", newLinks);
  };

  const updateServiceLink = (
    index: number,
    field: "label" | "url",
    value: string,
  ) => {
    const newLinks = [...servicesLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    handleFooterLinksChange("servicesLinks", newLinks);
  };

  const addExploreLink = () => {
    handleFooterLinksChange("exploreLinks", [
      ...exploreLinks,
      { label: "", url: "" },
    ]);
  };

  const removeExploreLink = (index: number) => {
    const newLinks = [...exploreLinks];
    newLinks.splice(index, 1);
    handleFooterLinksChange("exploreLinks", newLinks);
  };

  const updateExploreLink = (
    index: number,
    field: "label" | "url",
    value: string,
  ) => {
    const newLinks = [...exploreLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    handleFooterLinksChange("exploreLinks", newLinks);
  };

  return (
    <>
      {/* Dịch vụ Links */}
      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            name="servicesTitle"
            value={footerConfig.servicesTitle || ""}
            onChange={handleFooterChange}
            placeholder="Tiêu đề cột Dịch vụ (VD: Dịch vụ của chúng tôi)"
            className="font-semibold text-gray-700 dark:text-gray-200 px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="button"
            onClick={addServiceLink}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Thêm link
          </button>
        </div>
        <div className="space-y-3">
          {servicesLinks.map((link, index) => (
            <div key={index} className="flex gap-3 items-start">
              <input
                type="text"
                placeholder="Tên hiển thị"
                value={link.label}
                onChange={(e) =>
                  updateServiceLink(index, "label", e.target.value)
                }
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="URL (Link)"
                value={link.url}
                onChange={(e) =>
                  updateServiceLink(index, "url", e.target.value)
                }
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeServiceLink(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {servicesLinks.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Chưa có liên kết nào
            </p>
          )}
        </div>
      </div>

      {/* Khám phá Links */}
      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            name="exploreTitle"
            value={footerConfig.exploreTitle || ""}
            onChange={handleFooterChange}
            placeholder="Tiêu đề cột Khám phá (VD: Khám phá)"
            className="font-semibold text-gray-700 dark:text-gray-200 px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="button"
            onClick={addExploreLink}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Thêm link
          </button>
        </div>
        <div className="space-y-3">
          {exploreLinks.map((link, index) => (
            <div key={index} className="flex gap-3 items-start">
              <input
                type="text"
                placeholder="Tên hiển thị"
                value={link.label}
                onChange={(e) =>
                  updateExploreLink(index, "label", e.target.value)
                }
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="URL (Link)"
                value={link.url}
                onChange={(e) =>
                  updateExploreLink(index, "url", e.target.value)
                }
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeExploreLink(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {exploreLinks.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Chưa có liên kết nào
            </p>
          )}
        </div>
      </div>
    </>
  );
}
