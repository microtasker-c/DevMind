import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-2xl font-semibold">未找到这篇文章或页面</h1><p className="mt-4 text-muted">文章可能尚未发布，或链接已失效。</p><Link href="/" className="mt-6 inline-block underline underline-offset-4">返回首页</Link></main>;
}
