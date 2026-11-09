"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-2xl font-semibold">内容暂时无法加载</h1><p className="mt-4 text-muted">请检查网络后重试。如果问题持续，请稍后再访问。</p><div className="mt-6 flex items-center gap-5"><Button onPress={reset}>重试</Button><Link href="/" className="text-sm underline">返回首页</Link></div></main>;
}
