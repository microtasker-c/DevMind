import Link from "next/link";
import type { ArticleSummary } from "@/lib/articles/types";

const topicColors = [
  "bg-[#008a49] text-white",
  "bg-[#ffc43d] text-[#211900]",
  "bg-[#df003b] text-white",
];

function topicColor(topic: string) {
  let hash = 0;
  for (const character of topic) hash = (Math.imul(hash, 31) + character.codePointAt(0)!) >>> 0;
  return topicColors[hash % topicColors.length];
}

export function RightRail({ articles }: { articles: ArticleSummary[] }) {
  const topics = [...new Set(articles.flatMap((article) => article.tags))].slice(0, 10);
  return (
    <aside className="space-y-7">
      <section className="border-b border-divider pb-6">
        <h2 className="font-semibold">分享你的经验</h2>
        <p className="mt-3 text-sm leading-7 text-muted">一次排障、一段实践、一个新发现，都可以成为下一位开发者的起点。</p>
        <Link href="/write" className="mt-4 inline-block text-sm underline underline-offset-4">写一篇文章</Link>
      </section>
      {topics.length > 0 && (
        <section>
          <h2 className="font-semibold">探索技术标签</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Link key={topic} href={`/?q=${encodeURIComponent(topic)}`}
                className={`inline-flex max-w-full items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-[filter] hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${topicColor(topic)}`}>
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
                <span className="min-w-0 break-words">{topic}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <div className="text-xs leading-5 text-muted">Dev-Mind<br />为开发者沉淀可复用的答案<br />© 2026 Dev-Mind Community</div>
    </aside>
  );
}
