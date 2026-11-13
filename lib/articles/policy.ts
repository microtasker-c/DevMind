import { ArticleError } from "./errors";
import type { ArticleWriterSession } from "./types";

export function requireArticleWriter(session: ArticleWriterSession): string {
  if (!session) throw new ArticleError("UNAUTHENTICATED", "请先登录后再保存文章。");
  return session.user.id;
}

export function checkArticleEdit(
  article: { authorId: string; revision: number; status: string } | undefined,
  authorId: string,
  revision: number | undefined,
) {
  if (!article || article.authorId !== authorId) throw new ArticleError("NOT_FOUND", "文章不存在或无权编辑。");
  if (article.revision !== revision) throw new ArticleError("CONFLICT", "文章已在其他页面更新，请保留当前内容并刷新后重试。");
  if (article.status === "published") {
    throw new ArticleError("INVALID", "文章已发布，不可编辑。");
  }
}
