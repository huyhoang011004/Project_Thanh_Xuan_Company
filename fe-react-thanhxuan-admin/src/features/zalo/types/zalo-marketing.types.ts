export interface IZaloCampaign {
  _id: string;
  name: string;
  description?: string;
  messageContent: string;
  targetTag?: string;
  status: string;
  sentCount?: number;
  totalRecipients?: number;
  createdAt?: string;
}

export interface IZaloStep {
  stepOrder: number;
  delayDays: number;
  messageContent: string;
}

export interface IZaloSequence {
  _id: string;
  name: string;
  description?: string;
  trigger: string;
  steps: IZaloStep[];
  isActive?: boolean;
}
