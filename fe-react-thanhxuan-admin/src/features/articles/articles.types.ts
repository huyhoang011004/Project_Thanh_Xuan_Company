export interface ArticleItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  categoryId?: string | { _id: string; name: string };
  category?: { _id: string; name: string };
  thumbnail?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  isPinned: boolean;
  views?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlePayload {
  title: string;
  slug: string;
  description?: string;
  content: string;
  categoryId: string;
  thumbnail?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  isPinned: boolean;
}
