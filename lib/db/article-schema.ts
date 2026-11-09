import { sql } from "drizzle-orm";
import { check, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { ArticleDocument } from "../articles/types";
import { user } from "./schema";

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: text("author_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  title: text("title").notNull().default(""),
  excerpt: text("excerpt").notNull().default(""),
  coverUrl: text("cover_url"),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  readingMinutes: integer("reading_minutes").notNull().default(1),
  revision: integer("revision").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
}, (table) => [
  check("articles_status_check", sql`${table.status} in ('draft', 'published')`),
  check("articles_published_check", sql`(${table.status} = 'draft' and ${table.publishedAt} is null) or (${table.status} = 'published' and ${table.publishedAt} is not null and length(trim(${table.title})) > 0)`),
  check("articles_lengths_check", sql`length(${table.title}) <= 200 and length(${table.excerpt}) <= 500 and (${table.coverUrl} is null or length(${table.coverUrl}) <= 2048)`),
  check("articles_numbers_check", sql`${table.revision} > 0 and ${table.readingMinutes} > 0`),
  index("articles_published_feed_idx").on(table.publishedAt.desc(), table.id.desc()).where(sql`${table.status} = 'published'`),
  index("articles_author_updated_idx").on(table.authorId, table.updatedAt.desc(), table.id.desc()),
]).enableRLS();

export const articleContents = pgTable("article_contents", {
  articleId: uuid("article_id").primaryKey().references(() => articles.id, { onDelete: "cascade" }),
  document: jsonb("document").$type<ArticleDocument>().notNull(),
  formatVersion: integer("format_version").notNull().default(1),
}, (table) => [
  check("article_contents_format_check", sql`${table.formatVersion} = 1`),
  check("article_contents_document_check", sql`jsonb_typeof(${table.document}) = 'array' and jsonb_array_length(${table.document}) between 1 and 1000 and octet_length(${table.document}::text) <= 600000`),
]).enableRLS();

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
}, (table) => [check("tags_lengths_check", sql`length(${table.name}) between 1 and 32 and length(${table.slug}) between 1 and 64`)]).enableRLS();

export const articleTags = pgTable("article_tags", {
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.articleId, table.tagId] }),
  index("article_tags_tag_id_idx").on(table.tagId, table.articleId),
]).enableRLS();
