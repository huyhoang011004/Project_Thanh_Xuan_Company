export interface IContactItem {
  _id: string;
  fullName: string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  serviceCategory?: string;
  categorySlug?: string;
  notes?: string;
  message?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface ICategoryItem {
  _id: string;
  name: string;
  slug: string;
}
