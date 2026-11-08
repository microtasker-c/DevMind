"use client";

import { Button, Input } from "@heroui/react";
import { UserButton } from "@better-auth-ui/heroui";
import { Icon } from "./icons";

type TopbarProps = {
  isSidebarOpen: boolean;
  onMenuPress: () => void;
  onSearch: (value: string) => void;
};

export function Topbar({ isSidebarOpen, onMenuPress, onSearch }: TopbarProps) {
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
        <a
          className="shrink-0 text-2xl font-semibold tracking-[-0.05em] text-foreground sm:text-3xl"
          href="/"
        >
          Dev-Mind
        </a>
        <div className="hidden min-w-0 flex-1 sm:block sm:max-w-sm lg:ml-10">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-muted">
              <Icon name="search" size={18} />
            </span>
            <Input
              aria-label="搜索文章"
              className="w-full pl-10"
              placeholder="搜索技术文章"
              variant="primary"
              onChange={(event) => onSearch(event.target.value)}
            />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <Button className="hidden sm:flex" variant="ghost" onPress={() => undefined}>
            <Icon name="edit" size={18} />
            写文章
          </Button>
          <Button aria-label="通知" isIconOnly variant="ghost">
            <Icon name="bell" size={19} />
          </Button>
          <UserButton size="icon" hideSettings placement="bottom end" />
        </div>
      </div>
    </header>
  );
}
