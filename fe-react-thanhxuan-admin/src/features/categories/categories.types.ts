export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  type: 'SERVICE' | 'POST' | 'ABOUT';
  parentId?: string | null;
  description?: string;
  order?: number;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  type: 'SERVICE' | 'POST' | 'ABOUT';
  parentId?: string | null;
  description?: string;
  order?: number;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
}
