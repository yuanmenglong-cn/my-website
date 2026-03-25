// ===== Notion 相关类型 =====

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  cover: string | null;
  properties: Record<string, unknown>;
}

// ===== 博客文章类型 =====

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: string | null;
  publishedAt: string;
  tags: string[];
  status: "Published" | "Draft";
}

// ===== 项目类型 =====

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover: string | null;
  link: string | null;
  tags: string[];
  featured: boolean;
}

// ===== Notion 内容块类型 =====

export type NotionBlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "code"
  | "image"
  | "quote"
  | "divider"
  | "callout"
  | "table"
  | "table_row";

export interface NotionBlock {
  id: string;
  type: NotionBlockType;
  content: unknown;
  children?: NotionBlock[];
}
