import Link from "next/link";
import { requireVerifiedSession } from "@/lib/auth/guard";
import { listMyArticles } from "@/lib/articles/queries";
import { ArticleLayout } from "@/app/components/articles/article-layout";

export const metadata = { title: "我的文章 · Dev-Mind" };
export default async function MyArticlesPage() {
  const session = await requireVerifiedSession("/my/articles");
  const articles = await listMyArticles(session.user.id);
  return (
    <ArticleLayout activeItem="我的文章">
      <div className="flex items-center justify-between border-b border-divider pb-6">
        <h1 className="text-3xl font-semibold">我的文章</h1><Link className="text-sm underline underline-offset-4" href="/write">写新文章</Link>
      </div>
      {articles.length ? <ul className="divide-y divide-divider">{articles.map((article) => (
        <li key={article.id} className="space-y-3 py-6">
          <p className="text-xs text-muted">{article.status === "published" ? "已发布" : "草稿"} · 更新于 {new Date(article.updatedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</p>
          <h2 className="text-xl font-semibold break-words"><Link href={`/articles/${article.id}/edit`}>{article.title || "无标题草稿"}</Link></h2>
          <div className="flex gap-5 text-sm"><Link className="underline underline-offset-4" href={`/articles/${article.id}/edit`}>继续编辑</Link>{article.status === "published" && <Link className="text-muted" href={`/articles/${article.id}`}>公开阅读</Link>}</div>
        </li>
      ))}</ul> : <div className="py-16 text-center"><p className="text-muted">还没有文章，把你的第一个技术发现写下来。</p><Link href="/write" className="mt-5 inline-block underline underline-offset-4">开始写作</Link></div>}
    </ArticleLayout>
  );
}
