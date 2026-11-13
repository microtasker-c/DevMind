import { and, desc, eq, getTableColumns, ilike, inArray, lt, or, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { retryDatabaseRead } from "../db/read";
import { articleBookmarks, user } from "../db/schema";
import { articles, articleContents, articleTags, tags } from "../db/article-schema";
import { parseArticleDocument } from "./document-schema";
import { ArticleError } from "./errors";
import { encodeCursor, isArticleId, parseCursor } from "./validation";
import type { ArticleDetail, ArticlePage, ArticleSummary } from "./types";

const selection = {
  ...getTableColumns(articles),
  author: { name: user.name, image: user.image },
};
type SelectedArticle = typeof articles.$inferSelect & { author: { name: string; image: string | null } };
type QueryDatabase = Pick<ReturnType<typeof getDb>, "select">;

function readFromDatabase<T>(database: QueryDatabase | undefined, read: (db: QueryDatabase) => Promise<T>): Promise<T> {
  // A caller-owned transaction must handle its own failure and rollback.
  return database ? read(database) : retryDatabaseRead(() => read(getDb()));
}

async function toSummaries(rows: SelectedArticle[], db: QueryDatabase): Promise<ArticleSummary[]> {
  if (!rows.length) return [];
  const articleTagRows = await db.select({ articleId: articleTags.articleId, name: tags.name })
    .from(articleTags).innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(inArray(articleTags.articleId, rows.map((row) => row.id)))
    .orderBy(tags.name);
  const byArticle = new Map<string, string[]>();
  for (const tag of articleTagRows) {
    const names = byArticle.get(tag.articleId) ?? [];
    names.push(tag.name);
    byArticle.set(tag.articleId, names);
  }
  return rows.map((row) => ({
    id: row.id, authorId: row.authorId, title: row.title, excerpt: row.excerpt, coverUrl: row.coverUrl,
    status: row.status, readingMinutes: row.readingMinutes, revision: row.revision, author: row.author,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null, tags: byArticle.get(row.id) ?? [],
  }));
}

/** Optional database lets a server caller read consistently inside an existing transaction. */
export async function listArticles(
  { query = "", cursor }: { query?: string; cursor?: string } = {},
  database?: QueryDatabase,
): Promise<ArticlePage> {
  if (query.length > 100) throw new ArticleError("INVALID", "搜索关键词最多 100 字。");
  const page = cursor ? parseCursor(cursor) : null;
  const keyword = query.trim();
  const pattern = `%${keyword.replace(/[\\%_]/g, "\\$&")}%`;
  return readFromDatabase(database, async (db) => {
    const rows = await db.select(selection).from(articles).innerJoin(user, eq(articles.authorId, user.id))
      .where(and(
        eq(articles.status, "published"),
        keyword ? or(
          ilike(articles.title, pattern), ilike(articles.excerpt, pattern), ilike(user.name, pattern),
          sql`exists (select 1 from ${articleTags} inner join ${tags} on ${tags.id} = ${articleTags.tagId} where ${articleTags.articleId} = ${articles.id} and ${tags.name} ilike ${pattern})`,
        ) : undefined,
        page ? or(lt(articles.publishedAt, new Date(page.publishedAt)), and(eq(articles.publishedAt, new Date(page.publishedAt)), lt(articles.id, page.id))) : undefined,
      )).orderBy(desc(articles.publishedAt), desc(articles.id)).limit(13);
    const items = await toSummaries(rows.slice(0, 12), db);
    const last = items.at(-1);
    return {
      items,
      nextCursor: rows.length > 12 && last?.publishedAt ? encodeCursor({ id: last.id, publishedAt: last.publishedAt }) : null,
    };
  });
}

async function readArticle(id: string, authorId: string | undefined, db: QueryDatabase): Promise<ArticleDetail | null> {
  if (!isArticleId(id)) return null;
  const [row] = await db.select({ ...selection, document: articleContents.document, formatVersion: articleContents.formatVersion })
    .from(articles).innerJoin(user, eq(articles.authorId, user.id))
    .innerJoin(articleContents, eq(articleContents.articleId, articles.id))
    .where(and(eq(articles.id, id), authorId ? eq(articles.authorId, authorId) : eq(articles.status, "published")))
    .limit(1);
  if (!row) return null;
  if (row.formatVersion !== 1) throw new ArticleError("INVALID", "文章格式版本暂不受支持。");
  const [summary] = await toSummaries([row], db);
  return { ...summary, document: parseArticleDocument(row.document) };
}

export function getArticle(id: string, database?: QueryDatabase): Promise<ArticleDetail | null> {
  return readFromDatabase(database, (db) => readArticle(id, undefined, db));
}

/** Caller supplies the author from a verified server session, never from form data. */
export function getOwnedArticle(id: string, authorId: string, database?: QueryDatabase): Promise<ArticleDetail | null> {
  if (!authorId) return Promise.resolve(null);
  return readFromDatabase(database, (db) => readArticle(id, authorId, db));
}

export async function listMyArticles(authorId: string, database?: QueryDatabase): Promise<ArticleSummary[]> {
  return readFromDatabase(database, async (db) => {
    const rows = await db.select(selection).from(articles).innerJoin(user, eq(articles.authorId, user.id))
      .where(eq(articles.authorId, authorId)).orderBy(desc(articles.updatedAt), desc(articles.id));
    return toSummaries(rows, db);
  });
}

export async function listBookmarkedArticles(userId: string): Promise<ArticleSummary[]> {
  const db = getDb();
  const rows = await db.select(selection).from(articleBookmarks)
    .innerJoin(articles, sql`${articleBookmarks.articleId}::uuid = ${articles.id}`)
    .innerJoin(user, eq(articles.authorId, user.id))
    .where(and(eq(articleBookmarks.userId, userId), eq(articles.status, "published")))
    .orderBy(desc(articleBookmarks.createdAt));
  return toSummaries(rows, db);
}
