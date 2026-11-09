import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeReturnTo } from "@/lib/auth/access";
import { getAuthoritativeSession } from "@/lib/auth/guard";
import { VerificationControls } from "./verification-controls";

export const metadata: Metadata = { title: "验证邮箱 · Dev-Mind" };

export default async function VerifyEmailPage({ searchParams }: {
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  const session = await getAuthoritativeSession();
  if (!session) redirect(`/auth/sign-in?redirectTo=${encodeURIComponent(returnTo)}`);
  if (session.user.emailVerified) redirect(returnTo as Route);

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-background px-5 py-12">
      <section className="w-full max-w-md rounded-xl border border-divider bg-surface p-7 sm:p-9">
        <Link href="/" className="text-xl font-semibold tracking-tight">Dev-Mind</Link>
        <h1 className="mt-8 text-2xl font-semibold">验证你的邮箱</h1>
        <p className="mt-3 text-sm leading-7 text-muted">请打开验证邮件中的链接，完成后即可写作和管理账户。文章仍可公开阅读。</p>
        <p className="mt-4 break-all font-medium">{session.user.email}</p>
        {params.error && <p className="mt-4 text-sm text-danger" role="alert">验证链接无效或已过期，请重新发送验证邮件。</p>}
        <VerificationControls email={session.user.email} returnTo={returnTo} />
        <p className="mt-6 text-xs leading-6 text-muted">邮件可能进入垃圾邮件文件夹。验证链接 1 小时内有效。</p>
        <Link href="/" className="mt-5 inline-block text-sm underline underline-offset-4">先浏览文章</Link>
      </section>
    </main>
  );
}
