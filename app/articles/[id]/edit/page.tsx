import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/guard";
import { getOwnedArticle } from "@/lib/articles/queries";
import { ArticleEditor } from "@/app/components/articles/article-editor";
import { ArticleLayout } from "@/app/components/articles/article-layout";

export const metadata = { title: "编辑文章 · Dev-Mind" };
export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession(`/articles/${id}/edit`);
  const article = await getOwnedArticle(id, session.user.id);
  if (!article) notFound();
  if (article.status === "published") redirect(`/articles/${id}`);
  return <ArticleLayout writingMode><ArticleEditor key={article.id} initial={article} /></ArticleLayout>;
}
