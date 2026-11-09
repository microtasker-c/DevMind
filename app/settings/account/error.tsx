"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-10">
      <h1 className="text-2xl font-semibold">暂时无法加载账户设置</h1>
      <p role="alert" className="mt-3 mb-6 text-muted">请检查网络连接后重试。</p>
      <div className="flex items-center gap-4">
        <Button onPress={reset}>重试</Button>
        <Link href="/" className="text-sm underline">返回首页</Link>
      </div>
    </main>
  );
}
