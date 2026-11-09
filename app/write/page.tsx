import { requireSession } from "@/lib/auth/guard";
import { ArticleEditor } from "@/app/components/articles/article-editor";
import { ArticleLayout } from "@/app/components/articles/article-layout";

export const metadata = { title: "写文章 · Dev-Mind" };
export default async function WritePage() {
  await requireSession("/write");
  return <ArticleLayout writingMode><ArticleEditor /></ArticleLayout>;
}
