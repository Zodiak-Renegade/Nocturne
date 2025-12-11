
export type AuthorType = 'OWNER' | 'GUEST';

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML or Markdown string
  createdAt: number;
  updatedAt: number;
  tags: string[];
  coverImage?: string;
  isPublished: boolean;
  authorType: AuthorType;
  authorName?: string;
}

export type ViewState = 'HOME' | 'COMMUNITY' | 'READ' | 'EDIT' | 'CREATE' | 'DONATE' | 'FOUNDER' | 'ADMIN';

export enum GeminiAction {
  CONTINUE = 'CONTINUE',
  IMPROVE = 'IMPROVE',
  IDEAS = 'IDEAS'
}