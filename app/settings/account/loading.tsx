"use client";

import { Skeleton } from "@heroui/react";

export default function Loading() {
  return (
    <main aria-label="正在加载账户设置" aria-busy="true" className="mx-auto max-w-3xl space-y-6 px-5 py-12 sm:px-10">
      <Skeleton className="h-10 w-40 rounded-lg" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
    </main>
  );
}
