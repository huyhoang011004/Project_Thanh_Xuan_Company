// Adhering to SOLID & Design Patterns
import { apiClient } from "@/services/api.service";
import { EmailCampaign, EmailSequence, CampaignFormData, SequenceFormData } from "./admin-email.types";

export const AdminEmailService = {
  getCampaigns: async (): Promise<EmailCampaign[]> => {
    const data = await apiClient.get("/email-marketing/campaigns", true, { cache: "no-store" });
    return Array.isArray(data) ? data : [];
  },

  getSequences: async (): Promise<EmailSequence[]> => {
    const data = await apiClient.get("/email-marketing/sequences", true, { cache: "no-store" });
    return Array.isArray(data) ? data : [];
  },

  createCampaign: async (data: CampaignFormData): Promise<void> => {
    await apiClient.post("/email-marketing/campaigns", data, true);
  },

  executeCampaign: async (id: string): Promise<void> => {
    await apiClient.post(`/email-marketing/campaigns/${id}/run`, {}, true);
  },

  createSequence: async (data: SequenceFormData): Promise<void> => {
    const payload = {
      name: data.name,
      description: data.description,
      trigger: data.trigger,
      steps: [
        {
          stepOrder: 1,
          delayDays: data.delayDays,
          delayHours: 0,
          subject: data.subject,
          htmlContent: data.htmlContent,
        },
      ],
    };
    await apiClient.post("/email-marketing/sequences", payload, true);
  },
};
