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
};

export function CommunityShell({ activeItem, children, aside, query = "", mainClassName = "py-8 sm:py-10" }: CommunityShellProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar isSidebarOpen={isSidebarOpen} onMenuPress={() => setIsSidebarOpen((open) => !open)} query={query} />
      <div className={`mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-8 px-5 lg:gap-14 lg:px-10 ${isSidebarOpen ? "lg:grid-cols-[248px_minmax(0,1fr)_340px]" : "lg:grid-cols-[minmax(0,1fr)_340px]"}`}>
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
        {aside ?? <div className="hidden lg:block" />}
      </div>
    </div>
  );
}
