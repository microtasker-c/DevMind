import { Avatar, Card } from "@heroui/react";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/articles/types";

export function ArticleFeed({ articles, query }: { articles: ArticleSummary[]; query: string }) {
  return (
    <section aria-label="文章列表" className="min-w-0">
      <div className="mb-7 border-b border-divider pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">{query ? `搜索：${query}` : "最新洞见"}</h1>
        <p className="mt-2 text-sm text-muted">{query ? "查找标题、摘要、作者或技术标签" : "开发者的真实经验与技术思考"}</p>
      </div>
      <div className="space-y-5">
        {articles.length ? articles.map((article) => <ArticleCard key={article.id} article={article} />) : (
          <Card className="border-divider bg-surface p-8 text-center shadow-none">
            <Card.Content>
              <p className="text-muted">{query ? "没有找到匹配的文章，试试其他关键词。" : "还没有已发布的文章，分享你的第一个技术发现。"}</p>
              {!query && <Link className="mt-5 inline-block underline underline-offset-4" href="/write">开始写作</Link>}
            </Card.Content>
          </Card>
        )}
      </div>
    </section>
  );
}

function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Card className="border-divider/80 bg-surface p-5 shadow-none sm:p-6">
      <Card.Content>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <Avatar size="sm" color="accent" className="shrink-0 rounded-full">
            <Avatar.Image src={article.author.image ?? undefined} alt={`${article.author.name}的头像`} loading="lazy" />
            <Avatar.Fallback>{article.author.name.slice(0, 1)}</Avatar.Fallback>
          </Avatar>
          <span className="font-medium text-foreground">{article.author.name}</span>
          {article.publishedAt && <time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" })}</time>}
        </div>
        <div className={`mt-5 grid gap-5 ${article.coverUrl ? "sm:grid-cols-[1fr_156px] sm:items-center" : ""}`}>
          <div>
            <h2 className="text-xl font-semibold leading-snug tracking-tight break-words sm:text-2xl"><Link className="hover:underline" href={`/articles/${article.id}`}>{article.title}</Link></h2>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted sm:text-base">{article.excerpt}</p>
          </div>
          {article.coverUrl && <Link href={`/articles/${article.id}`} tabIndex={-1} aria-hidden="true">
            {/* User-provided cover links are rendered without server-side image fetching. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.coverUrl} alt="" referrerPolicy="no-referrer" loading="lazy" className="aspect-[1.35] w-full rounded-lg object-cover" />
          </Link>}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span>{article.readingMinutes} 分钟阅读</span>
          {article.tags.map((tag) => <Link key={tag} href={`/?q=${encodeURIComponent(tag)}`} className="rounded-full bg-background px-3 py-1">{tag}</Link>)}
        </div>
      </Card.Content>
    </Card>
  );
}
