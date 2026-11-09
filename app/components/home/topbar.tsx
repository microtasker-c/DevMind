"use client";

import { Button, Input } from "@heroui/react";
import Link from "next/link";
import { AccountMenu } from "../account/account-menu";
import { Icon } from "./icons";

type TopbarProps = {
  isSidebarOpen: boolean;
  onMenuPress: () => void;
  query: string;
};

export function Topbar({ isSidebarOpen, onMenuPress, query }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-divider/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-[1800px] items-center gap-4 px-5 lg:px-10">
        <Button
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? "关闭导航" : "打开导航"}
          className="text-foreground"
          isIconOnly
          variant="ghost"
          onPress={onMenuPress}
        >
          <Icon name="menu" />
        </Button>
        <Link
          className="shrink-0 text-2xl font-semibold tracking-[-0.05em] text-foreground sm:text-3xl"
          href="/"
        >
          Dev-Mind
        </Link>
        <div className="hidden min-w-0 flex-1 sm:block sm:max-w-sm lg:ml-10">
          <form action="/" role="search" className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-muted">
              <Icon name="search" size={18} />
            </span>
            <Input
              aria-label="搜索文章"
              className="w-full pl-10"
              placeholder="搜索技术文章"
              variant="primary"
              key={query}
              name="q"
              maxLength={100}
              defaultValue={query}
            />
          </form>
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <Link className="inline-flex items-center gap-2 px-2 py-2 text-sm" href="/write">
            <Icon name="edit" size={18} />
            写文章
          </Link>
          <Button aria-label="通知" isIconOnly variant="ghost">
            <Icon name="bell" size={19} />
          </Button>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
