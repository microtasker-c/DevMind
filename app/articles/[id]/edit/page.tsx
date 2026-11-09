import { notFound } from "next/navigation";
import { requireVerifiedSession } from "@/lib/auth/guard";
import { getOwnedArticle } from "@/lib/articles/queries";
import { ArticleEditor } from "@/app/components/articles/article-editor";
import { ArticleLayout } from "@/app/components/articles/article-layout";

export const metadata = { title: "编辑文章 · Dev-Mind" };
export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireVerifiedSession(`/articles/${id}/edit`);
  const article = await getOwnedArticle(id, session.user.id);
  if (!article) notFound();
  return <ArticleLayout><ArticleEditor key={article.id} initial={article} /></ArticleLayout>;
}
