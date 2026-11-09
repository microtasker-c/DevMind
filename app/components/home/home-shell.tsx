"use client";

import Link from "next/link";
import { ArticleFeed } from "./article-feed";
import type { ArticleSummary } from "@/lib/articles/types";
import { RightRail } from "./right-rail";
import { CommunityShell } from "./community-shell";

export function HomeShell({ articles, query, nextCursor }: { articles: ArticleSummary[]; query: string; nextCursor: string | null }) {
  const nextQuery = new URLSearchParams({ ...(query ? { q: query } : {}), ...(nextCursor ? { cursor: nextCursor } : {}) });

  return (
    <CommunityShell
      activeItem="首页"
      query={query}
      aside={<div className="hidden py-10 lg:block"><RightRail articles={articles} /></div>}
    >
      <ArticleFeed articles={articles} query={query} />
      {nextCursor && <Link className="mt-8 block text-center text-sm underline underline-offset-4" href={`/?${nextQuery.toString()}`}>下一页</Link>}
      {query && <Link className="mt-5 block text-center text-sm text-muted underline" href="/">清除搜索</Link>}
    </CommunityShell>
  );
}
