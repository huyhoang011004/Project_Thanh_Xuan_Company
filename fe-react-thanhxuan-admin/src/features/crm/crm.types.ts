export interface CustomerItem {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
  tags?: string[];
  notes?: string;
  createdAt: string;
}
