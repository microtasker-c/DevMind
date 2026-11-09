import type { PartialBlock } from "@blocknote/core";

export type ArticleDocument = PartialBlock[];
export type ArticleStatus = "draft" | "published";

export type SaveArticleInput = {
  id?: string;
  revision?: number;
  title: string;
  excerpt: string;
  coverUrl: string;
  tags: string[];
  status: ArticleStatus;
  document: ArticleDocument;
};

export type ArticleSummary = {
  id: string;
  authorId: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  status: ArticleStatus;
  readingMinutes: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  author: { name: string; image: string | null };
  tags: string[];
};

export type ArticleDetail = ArticleSummary & { document: ArticleDocument };
export type ArticlePage = { items: ArticleSummary[]; nextCursor: string | null };
export type ArticleWriterSession = { user: { id: string; emailVerified: boolean } } | null;
