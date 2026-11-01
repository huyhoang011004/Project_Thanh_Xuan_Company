// Adhering to SOLID & Design Patterns
export interface EmailCampaign {
  _id: string;
  name: string;
  description?: string;
  subject: string;
  htmlContent: string;
  targetTag: string;
  targetEmailSubscribersOnly: boolean;
  status: "draft" | "scheduled" | "running" | "completed" | "paused";
  scheduledAt?: string;
  totalRecipients: number;
  sentCount: number;
  successCount: number;
  failedCount: number;
  createdAt: string;
}

export interface EmailSequenceStep {
  stepOrder: number;
  delayDays: number;
  delayHours: number;
  subject: string;
  htmlContent: string;
}

export interface EmailSequence {
  _id: string;
  name: string;
  description?: string;
  trigger: "on_subscribe" | "after_order" | "inactive_customer";
  isActive: boolean;
  steps: EmailSequenceStep[];
  createdAt: string;
}

export interface CampaignFormData {
  name: string;
  description: string;
  subject: string;
  htmlContent: string;
  targetTag: string;
}

export interface SequenceFormData {
  name: string;
  description: string;
  trigger: "on_subscribe" | "after_order" | "inactive_customer";
  delayDays: number;
  subject: string;
  htmlContent: string;
}
