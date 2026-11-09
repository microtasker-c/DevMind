import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/articles/queries";
import { ArticleBody } from "@/app/components/articles/article-body";
import { ArticleLayout } from "@/app/components/articles/article-layout";

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).id);
  return { title: article ? `${article.title} · Dev-Mind` : "文章未找到 · Dev-Mind", description: article?.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle((await params).id);
  if (!article) notFound();
  return (
    <ArticleLayout>
      <article>
        <Link href="/" className="text-sm text-muted hover:underline">返回首页</Link>
        <h1 className="mt-8 text-3xl leading-tight font-semibold tracking-tight break-words sm:text-4xl">{article.title}</h1>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="font-medium text-foreground">{article.author.name}</span>
          {article.publishedAt && <time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" })}</time>}
          <span>{article.readingMinutes} 分钟阅读</span>
        </div>
        {article.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{article.tags.map((tag) => <Link key={tag} href={`/?q=${encodeURIComponent(tag)}`} className="rounded-full bg-background px-3 py-1 text-xs text-muted">{tag}</Link>)}</div>}
        {article.coverUrl && (
          // User-provided remote URLs cannot be enumerated in Next Image remotePatterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverUrl} alt="" referrerPolicy="no-referrer" className="mt-8 max-h-[440px] w-full rounded-lg object-cover" />
        )}
        <div className="mt-10"><ArticleBody document={article.document} /></div>
      </article>
    </ArticleLayout>
  );
}
