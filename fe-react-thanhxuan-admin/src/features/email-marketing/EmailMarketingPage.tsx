// Adhering to SOLID & Design Patterns
"use client";

import { Mail, Plus } from "lucide-react";
import { useAdminEmailMarketing } from "./useAdminEmailMarketing";
import {
  EmailMarketingTabsComponent,
  EmailCampaignsListComponent,
  EmailSequencesListComponent,
} from "./components";
import { EmailCampaignModal, EmailSequenceModal } from "./modals";

export function EmailMarketingPage() {
  const {
    activeTab,
    setActiveTab,
    campaigns,
    sequences,
    loading,
    isCampaignModalOpen,
    setIsCampaignModalOpen,
    campaignData,
    setCampaignData,
    isSequenceModalOpen,
    setIsSequenceModalOpen,
    sequenceData,
    setSequenceData,
    handleCreateCampaign,
    handleExecuteCampaign,
    handleCreateSequence,
  } = useAdminEmailMarketing();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-7 h-7 text-blue-600" /> Quản lý Email Marketing
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tạo chiến dịch gửi email hàng loạt và thiết lập kịch bản email tự động
            (Automation)
          </p>
        </div>
        <div>
          {activeTab === "campaigns" ? (
            <button
              onClick={() => setIsCampaignModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/20 hover:opacity-95 transition"
            >
              <Plus className="w-5 h-5" /> Tạo chiến dịch Email mới
            </button>
          ) : (
            <button
              onClick={() => setIsSequenceModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md shadow-emerald-500/20 hover:opacity-95 transition"
            >
              <Plus className="w-5 h-5" /> Tạo kịch bản Email tự động
            </button>
          )}
        </div>
      </div>

      <EmailMarketingTabsComponent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        campaignsCount={campaigns.length}
        sequencesCount={sequences.length}
      />

      {activeTab === "campaigns" ? (
        <EmailCampaignsListComponent
          campaigns={campaigns}
          loading={loading}
          onExecuteCampaign={handleExecuteCampaign}
        />
      ) : (
        <EmailSequencesListComponent sequences={sequences} loading={loading} />
      )}

      <EmailCampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        campaignData={campaignData}
        setCampaignData={setCampaignData}
        onSubmit={handleCreateCampaign}
      />

      <EmailSequenceModal
        isOpen={isSequenceModalOpen}
        onClose={() => setIsSequenceModalOpen(false)}
        sequenceData={sequenceData}
        setSequenceData={setSequenceData}
        onSubmit={handleCreateSequence}
      />
    </div>
  );
}
