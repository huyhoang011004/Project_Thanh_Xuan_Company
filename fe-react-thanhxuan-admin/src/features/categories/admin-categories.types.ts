export interface FormDataProps {
  name: string;
  slug: string;
  type: "SERVICE" | "POST" | "ABOUT";
  parentId: string;
  description: string;
  order: number;
  meta_title: string;
  meta_description: string;
  is_active: boolean;
}

export interface ICategoryNode {
  _id: string;
  name: string;
  slug: string;
  type: "SERVICE" | "POST" | "ABOUT";
  parentId: string | null;
  description?: string;
  icon?: string;
  order?: number;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
  children?: ICategoryNode[];
}
