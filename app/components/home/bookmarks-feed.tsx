"use client";

import type { ArticleSummary } from "@/lib/articles/types";
import { ArticleFeed } from "./article-feed";

export function BookmarksFeed({ articles }: { articles: ArticleSummary[] }) {
  return <ArticleFeed articles={articles} query="" />;
}
