import type { Metadata } from "next";
import Link from "next/link";
import { ProfileSettings } from "@/app/components/account/profile-settings";
import { requireSession } from "@/lib/auth/guard";
import { AccountMenu } from "@/app/components/account/account-menu";

export const metadata: Metadata = { title: "账户设置 · Dev-Mind" };

export default async function AccountSettingsPage() {
  await requireSession("/settings/account");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-divider/70 bg-surface">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-10">
          <Link href="/" className="text-2xl font-semibold tracking-[-0.05em]">Dev-Mind</Link>
          <AccountMenu />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-10 sm:py-12">
        <Link href="/" className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline">← 返回首页</Link>
        <div className="mt-8 mb-8 border-b border-divider pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">账户设置</h1>
          <p className="mt-3 text-sm text-muted">管理你在 Dev-Mind 展示的个人资料。</p>
        </div>
        <ProfileSettings />
      </main>
    </div>
  );
}
