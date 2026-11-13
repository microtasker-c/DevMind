"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type CommunityShellProps = {
  activeItem?: string;
  children: ReactNode;
  aside?: ReactNode;
  query?: string;
  mainClassName?: string;
  writingMode?: boolean;
  readingMode?: boolean;
};

export function CommunityShell({ activeItem, children, aside, query = "", mainClassName = "py-8 sm:py-10", writingMode = false, readingMode = false }: CommunityShellProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!writingMode && !readingMode);
  const columns = writingMode || readingMode
    ? isSidebarOpen ? "lg:grid-cols-[248px_minmax(0,1fr)]" : "lg:grid-cols-1"
    : isSidebarOpen ? "lg:grid-cols-[248px_minmax(0,1fr)_340px]" : "lg:grid-cols-[minmax(0,1fr)_340px]";

  return (
    <div className={`min-h-screen text-foreground ${readingMode ? "bg-surface" : "bg-background"}`}>
      <Topbar isSidebarOpen={isSidebarOpen} onMenuPress={() => setIsSidebarOpen((open) => !open)} query={query} />
      <div className={`mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-8 px-5 lg:gap-14 lg:px-10 ${columns}`}>
        <Sidebar
          activeItem={activeItem ?? ""}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelect={(item) => {
            if (item === "我的文章") router.push("/my/articles");
            if (item === "个人资料") router.push("/settings/account");
            if (item === "首页") router.push("/");
          }}
        />
        <main className={`min-w-0 ${mainClassName}`}>{children}</main>
        {!writingMode && !readingMode && (aside ?? <div className="hidden lg:block" />)}
      </div>
    </div>
  );
}
