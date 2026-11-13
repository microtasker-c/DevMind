import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../db/client";
import { articles, articleContents, articleTags, tags } from "../db/article-schema";
import { ArticleError } from "./errors";
import { checkArticleEdit, requireArticleWriter } from "./policy";
import { parseSaveArticle } from "./validation";
import type { ArticleWriterSession } from "./types";

export { ArticleError } from "./errors";

/** A transaction may be supplied when composing this write with another server operation. */
export async function saveArticle(
  session: ArticleWriterSession,
  input: unknown,
  database?: Pick<ReturnType<typeof getDb>, "transaction">,
): Promise<{ id: string; revision: number }> {
  const authorId = requireArticleWriter(session);
  const value = parseSaveArticle(input);
  return (database ?? getDb()).transaction(async (tx) => {
    const now = new Date();
    const fields = {
      title: value.title, excerpt: value.excerpt, coverUrl: value.coverUrl,
      status: value.status, readingMinutes: value.readingMinutes, updatedAt: now,
    };
    let saved: { id: string; revision: number } | undefined;
    if (value.id) {
      const [current] = await tx.select().from(articles)
        .where(and(eq(articles.id, value.id), eq(articles.authorId, authorId))).for("update");
      checkArticleEdit(current, authorId, value.revision);
      const [updated] = await tx.update(articles).set({
        ...fields, revision: current.revision + 1,
        publishedAt: current.publishedAt ?? (value.status === "published" ? now : null),
      }).where(and(eq(articles.id, value.id), eq(articles.authorId, authorId), eq(articles.revision, current.revision)))
        .returning({ id: articles.id, revision: articles.revision });
      saved = updated;
    } else {
      const [created] = await tx.insert(articles).values({
        ...fields, authorId, publishedAt: value.status === "published" ? now : null,
      }).returning({ id: articles.id, revision: articles.revision });
      saved = created;
    }
    if (!saved) throw new ArticleError("CONFLICT", "保存时文章已更新，请刷新后重试。");
    await tx.insert(articleContents).values({ articleId: saved.id, document: value.document })
      .onConflictDoUpdate({ target: articleContents.articleId, set: { document: value.document } });
    await tx.delete(articleTags).where(eq(articleTags.articleId, saved.id));
    if (value.tags.length) {
      // Deterministic order avoids deadlocks when concurrent articles create the same tags.
      const orderedTags = [...value.tags].sort((left, right) => left.slug.localeCompare(right.slug));
      await tx.insert(tags).values(orderedTags).onConflictDoNothing({ target: tags.slug });
      const tagRows = await tx.select({ id: tags.id }).from(tags).where(inArray(tags.slug, orderedTags.map((tag) => tag.slug)));
      await tx.insert(articleTags).values(tagRows.map((tag) => ({ articleId: saved.id, tagId: tag.id })));
    }
    return saved;
  });
}
