"use client";

import { Button } from "@heroui/react";

export default function VerificationError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-md space-y-5 px-5 py-20">
      <h1 className="text-2xl font-semibold">暂时无法检查验证状态</h1>
      <p className="text-muted">请检查网络后重试。</p>
      <Button onPress={reset}>重试</Button>
    </main>
  );
}
