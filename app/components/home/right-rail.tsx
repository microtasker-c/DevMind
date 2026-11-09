import Link from "next/link";
import type { ArticleSummary } from "@/lib/articles/types";

export function RightRail({ articles }: { articles: ArticleSummary[] }) {
  const topics = [...new Set(articles.flatMap((article) => article.tags))].slice(0, 10);
  return (
    <aside className="space-y-7">
      <section className="border-b border-divider pb-6">
        <h2 className="font-semibold">分享你的经验</h2>
        <p className="mt-3 text-sm leading-7 text-muted">一次排障、一段实践、一个新发现，都可以成为下一位开发者的起点。</p>
        <Link href="/write" className="mt-4 inline-block text-sm underline underline-offset-4">写一篇文章</Link>
      </section>
      {topics.length > 0 && <section><h2 className="font-semibold">探索技术标签</h2><div className="mt-4 flex flex-wrap gap-2">{topics.map((topic) => <Link key={topic} href={`/?q=${encodeURIComponent(topic)}`} className="rounded-full border border-divider px-3 py-1.5 text-xs text-muted">{topic}</Link>)}</div></section>}
      <div className="text-xs leading-5 text-muted">Dev-Mind<br />为开发者沉淀可复用的答案<br />© 2026 Dev-Mind Community</div>
    </aside>
  );
}
