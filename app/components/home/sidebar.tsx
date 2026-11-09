"use client";

import { Button } from "@heroui/react";
import { Icon } from "./icons";

type SidebarProps = {
  activeItem: string;
  onSelect: (item: string) => void;
  isOpen: boolean;
  onClose?: () => void;
};

const items = [
  { label: "首页", icon: "home" as const },
  { label: "收藏", icon: "bookmark" as const },
  { label: "我的文章", icon: "edit" as const },
  { label: "个人资料", icon: "user" as const },
  { label: "数据概览", icon: "chart" as const },
];

export function Sidebar({ activeItem, onSelect, isOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={`${isOpen ? "translate-x-0 lg:block lg:translate-x-0" : "-translate-x-full lg:hidden"} fixed inset-y-20 left-0 z-10 w-72 border-r border-divider bg-background p-5 transition-transform lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:w-auto lg:border-r-0 lg:bg-transparent lg:p-0 lg:pt-10`}
    >
      <div className="flex h-full flex-col">
        <nav className="space-y-1">
          {items.map((item) => (
            <Button
              key={item.label}
              fullWidth
              className={`justify-start gap-3 px-4 ${
                activeItem === item.label
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:bg-surface"
              }`}
              variant="ghost"
              onPress={() => {
                onSelect(item.label);
                if (window.matchMedia("(max-width: 1023px)").matches) {
                  onClose?.();
                }
              }}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
        <div className="my-7 h-px bg-divider" />
        <div className="px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            正在关注
          </p>
          <div className="mt-5 space-y-4 text-sm text-muted">
            <p className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                AI
              </span>
              人工智能前沿
            </p>
            <p className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/20 text-xs font-semibold text-warning-foreground">
                FE
              </span>
              前端工程实践
            </p>
          </div>
          <Button className="mt-5 px-0 text-accent" variant="ghost">
            <Icon name="plus" size={17} />
            发现更多主题
          </Button>
        </div>
        <p className="mt-auto hidden px-4 pb-5 text-xs leading-5 text-muted lg:block">
          Dev-Mind
          <br />
          为开发者沉淀可复用的答案
        </p>
      </div>
    </aside>
  );
}
