"use client";
// Adhering to SOLID & Design Patterns
import { useState, useEffect, useCallback } from "react";
import { EmailCampaign, EmailSequence, CampaignFormData, SequenceFormData } from "./admin-email.types";
import { AdminEmailService } from "./admin-email.service";

export function useAdminEmailMarketing() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "sequences">("campaigns");
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignFormData>({
    name: "",
    description: "",
    subject: "",
    htmlContent: "",
    targetTag: "tat-ca",
  });

  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  const [sequenceData, setSequenceData] = useState<SequenceFormData>({
    name: "",
    description: "",
    trigger: "on_subscribe",
    delayDays: 0,
    subject: "",
    htmlContent: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "campaigns") {
        const data = await AdminEmailService.getCampaigns();
        setCampaigns(data);
      } else {
        const data = await AdminEmailService.getSequences();
        setSequences(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AdminEmailService.createCampaign(campaignData);
      setIsCampaignModalOpen(false);
      setCampaignData({ name: "", description: "", subject: "", htmlContent: "", targetTag: "tat-ca" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi tạo chiến dịch!");
    }
  };

  const handleExecuteCampaign = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn thực thi chiến dịch gửi email này?")) return;
    try {
      await AdminEmailService.executeCampaign(id);
      alert("Đã bắt đầu thực thi chiến dịch Email!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi gửi chiến dịch!");
    }
  };

  const handleCreateSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AdminEmailService.createSequence(sequenceData);
      setIsSequenceModalOpen(false);
      setSequenceData({ name: "", description: "", trigger: "on_subscribe", delayDays: 0, subject: "", htmlContent: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo chuỗi tự động!");
    }
  };

  return {
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
  };
}
