// Adhering to SOLID & Design Patterns
export interface Order {
  _id: string;
  orderCode: string;
  customerName: string;
  phoneNumber: string;
  address?: string;
  serviceCategory: string;
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  notes?: string;
  createdAt?: string;
}

export interface OrderFormData {
  customerName: string;
  phoneNumber: string;
  address: string;
  serviceCategory: string;
  totalAmount: number;
  notes: string;
}

export interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
}
