// Adhering to SOLID & Design Patterns
export interface CrmCustomer {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  isZaloFollower: boolean;
  isEmailSubscriber: boolean;
  tags?: string[];
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}
