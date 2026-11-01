export type ContactStatus = 'NEW' | 'PROCESSING' | 'RESOLVED' | 'SPAM';

export interface ContactItem {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  serviceCategory?: string;
  sourceUrl?: string;
  message?: string;
  status: ContactStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
