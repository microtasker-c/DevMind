"use client";

import { useMemo, useState } from "react";
import { ArticleFeed } from "./article-feed";
import { articles } from "./home-data";
import { RightRail } from "./right-rail";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function HomeShell() {
  const [activeItem, setActiveItem] = useState("首页");
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const filteredArticles = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return articles;

    return articles.filter((article) =>
      [article.title, article.excerpt, article.author, article.topic].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar
        isSidebarOpen={isSidebarOpen}
        onMenuPress={() => setIsSidebarOpen((open) => !open)}
        onSearch={setSearch}
      />
      <div
        className={`mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-8 px-5 lg:gap-14 lg:px-10 ${
          isSidebarOpen
            ? "lg:grid-cols-[248px_minmax(0,1fr)_340px]"
            : "lg:grid-cols-[minmax(0,1fr)_340px]"
        }`}
      >
        <Sidebar
          activeItem={activeItem}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelect={setActiveItem}
        />
        <main className="min-w-0 py-8 sm:py-10">
          <ArticleFeed articles={filteredArticles} />
        </main>
        <div className="hidden py-10 lg:block">
          <RightRail />
        </div>
      </div>
    </div>
  );
}
