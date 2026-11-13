import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/articles/queries";
import { ArticleBody } from "@/app/components/articles/article-body";
import { ArticleLayout } from "@/app/components/articles/article-layout";
import { BookmarkButton } from "@/app/components/articles/bookmark-button";

const getCachedArticle = cache(getArticle);

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getCachedArticle((await params).id);
  return { title: article ? `${article.title} · Dev-Mind` : "文章未找到 · Dev-Mind", description: article?.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getCachedArticle((await params).id);
  if (!article) notFound();
  return (
    <ArticleLayout readingMode>
      <article className="pb-12 sm:pb-20">
        <Link href="/" className="inline-flex text-sm text-muted underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">返回首页</Link>
        {article.coverUrl && (
          // User-provided remote URLs cannot be enumerated in Next Image remotePatterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverUrl} alt="" referrerPolicy="no-referrer" className="mt-8 h-auto max-h-[560px] w-full rounded-sm object-contain" />
        )}
        <header className="mx-auto mt-10 max-w-[42rem] sm:mt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            {article.tags.length > 0 ? <div aria-label="技术标签" className="flex flex-wrap items-center gap-2">
              {article.tags.map((tag) => <Link key={tag} href={`/?q=${encodeURIComponent(tag)}`} className="max-w-full rounded-full border border-divider px-3 py-1 text-xs break-words text-muted transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-sm">{tag}</Link>)}
            </div> : <span />}
            <BookmarkButton articleId={article.id} />
          </div>
          <h1 className="text-[2rem] leading-[1.2] font-bold tracking-[-0.035em] break-words sm:text-5xl">{article.title}</h1>
          {article.excerpt && <p className="mt-5 text-lg leading-relaxed break-words text-muted sm:text-xl">{article.excerpt}</p>}
          <div className="mt-8 flex items-center gap-3 border-b border-divider pb-7">
            <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background text-lg font-semibold">{Array.from(article.author.name)[0]}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium break-words text-foreground">{article.author.name}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted sm:text-sm">
                {article.publishedAt && <time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "long", day: "numeric" })}</time>}
                <span>{article.readingMinutes} 分钟阅读</span>
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto mt-9 max-w-[42rem] sm:mt-12"><ArticleBody document={article.document} /></div>
      </article>
    </ArticleLayout>
  );
}
