import type { ReactNode } from "react";
import { CommunityShell } from "@/app/components/home/community-shell";

export function ArticleLayout({ children, activeItem }: { children: ReactNode; activeItem?: string }) {
  return (
    <CommunityShell activeItem={activeItem} mainClassName="py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </CommunityShell>
  );
}
