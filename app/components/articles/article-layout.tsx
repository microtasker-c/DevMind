import type { ReactNode } from "react";
import { CommunityShell } from "@/app/components/home/community-shell";

export function ArticleLayout({ children, activeItem, writingMode = false, readingMode = false }: { children: ReactNode; activeItem?: string; writingMode?: boolean; readingMode?: boolean }) {
  return (
    <CommunityShell activeItem={activeItem} writingMode={writingMode} readingMode={readingMode} mainClassName="py-6 sm:py-10">
      <div className={`mx-auto w-full ${writingMode ? "max-w-6xl" : readingMode ? "max-w-4xl" : "max-w-3xl"}`}>{children}</div>
    </CommunityShell>
  );
}
