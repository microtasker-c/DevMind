import nextEnv from "@next/env";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { saveArticle } from "../lib/articles/service.ts";
import { getArticle, getOwnedArticle, listArticles, listMyArticles } from "../lib/articles/queries.ts";
import { articles as articleTable, articleContents } from "../lib/db/article-schema.ts";

if (process.env.RUN_DB_INTEGRATION !== "1") {
  console.log("Skipped article database integration. Set RUN_DB_INTEGRATION=1 to run in a rollback-only isolated schema.");
} else {
nextEnv.loadEnvConfig(process.cwd());
const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 10 });
const db = drizzle(client);
const sandbox = `article_test_${crypto.randomUUID().replaceAll("-", "")}`;
const rollback = new Error("ROLLBACK_TEST_ONLY");
const owner = { user: { id: "article-test-author", emailVerified: true } };
const other = { user: { id: "article-test-other", emailVerified: true } };
const payload = {
  title: "", excerpt: "", coverUrl: "", tags: [], status: "draft",
  document: [{ type: "paragraph", content: [{ type: "text", text: "", styles: {} }] }],
};
let assertions = 0;
try {
  const migration = (await readFile(new URL("../drizzle/0001_ambiguous_mad_thinker.sql", import.meta.url), "utf8"))
    .replaceAll('"public".', `"${sandbox}".`);
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql.raw(`CREATE SCHEMA "${sandbox}"`));
      await tx.execute(sql.raw(`SET LOCAL search_path TO "${sandbox}", pg_catalog`));
      await tx.execute(sql.raw('CREATE TABLE "user" (id text primary key, name text not null, image text)'));
      for (const statement of migration.split("--> statement-breakpoint")) {
        if (statement.trim()) await tx.execute(sql.raw(statement));
      }
      await tx.execute(sql`insert into "user" (id, name) values (${owner.user.id}, '测试作者'), (${other.user.id}, '其他作者')`);
      const draft = await saveArticle(owner, payload, tx);
      assert.equal(draft.revision, 1); assertions++;
      let rows = await tx.execute(sql`select status, published_at, title from articles where id = ${draft.id}`);
      assert.equal(rows[0].status, "draft"); assert.equal(rows[0].published_at, null); assertions += 2;
      assert.equal(await getArticle(draft.id, tx), null); assertions++;
      assert.equal((await getOwnedArticle(draft.id, owner.user.id, tx)).id, draft.id); assertions++;
      assert.equal(await getOwnedArticle(draft.id, other.user.id, tx), null); assertions++;
      assert.equal((await listMyArticles(owner.user.id, tx)).length, 1); assertions++;
      assert.equal((await listArticles({}, tx)).items.length, 0); assertions++;
      await assert.rejects(saveArticle(null, payload, tx), /登录/); assertions++;
      await assert.rejects(saveArticle({ user: { id: owner.user.id, emailVerified: false } }, payload, tx), /验证/); assertions++;
      await assert.rejects(saveArticle(other, { ...payload, id: draft.id, revision: 1 }, tx), /不存在/); assertions++;
      const published = await saveArticle(owner, {
        ...payload, id: draft.id, revision: 1, status: "published", title: "公开文章", tags: ["TypeScript", "数据库"],
        document: [{ type: "heading", props: { level: 2 }, content: "标题" }, { type: "paragraph", content: "真实正文" }],
      }, tx);
      assert.equal(published.revision, 2); assertions++;
      rows = await tx.execute(sql`select status, published_at, title, excerpt from articles where id = ${draft.id}`);
      const publishedAt = rows[0].published_at;
      assert.equal(rows[0].status, "published"); assert.ok(publishedAt); assertions += 2;
      assert.equal((await tx.execute(sql`select count(*)::int as n from article_tags where article_id = ${draft.id}`))[0].n, 2); assertions++;
      await assert.rejects(saveArticle(owner, { ...payload, id: draft.id, revision: 1 }, tx), /更新/); assertions++;
      await assert.rejects(saveArticle(owner, { ...payload, id: draft.id, revision: 2 }, tx), /已发布/); assertions++;
      const update = await saveArticle(owner, {
        ...payload, id: draft.id, revision: 2, status: "published", title: "更新立即公开", tags: ["TypeScript"],
        document: [{ type: "paragraph", content: "更新后的正文" }],
      }, tx);
      assert.equal(update.revision, 3); assertions++;
      rows = await tx.execute(sql`select title, published_at from articles where id = ${draft.id}`);
      assert.equal(rows[0].title, "更新立即公开"); assert.deepEqual(rows[0].published_at, publishedAt); assertions += 2;
      assert.equal((await tx.execute(sql`select count(*)::int as n from article_tags where article_id = ${draft.id}`))[0].n, 1); assertions++;
      assert.equal((await getArticle(draft.id, tx)).title, "更新立即公开"); assertions++;
      assert.equal((await listArticles({ query: "TypeScript" }, tx)).items.length, 1); assertions++;
      assert.equal((await listArticles({ query: "测试作者" }, tx)).items.length, 1); assertions++;
      assert.equal((await listArticles({ query: "无结果" }, tx)).items.length, 0); assertions++;
      const sameTimestamp = new Date("2026-11-09T00:00:00.123Z");
      const pageRows = await tx.insert(articleTable).values(Array.from({ length: 15 }, (_, index) => ({
        authorId: owner.user.id, title: `分页测试 ${index}`, status: "published", publishedAt: sameTimestamp,
      }))).returning({ id: articleTable.id });
      await tx.insert(articleContents).values(pageRows.map((row) => ({ articleId: row.id, document: payload.document })));
      const first = await listArticles({ query: "分页测试" }, tx);
      const second = await listArticles({ query: "分页测试", cursor: first.nextCursor }, tx);
      assert.equal(first.items.length, 12); assert.equal(second.items.length, 3); assertions += 2;
      assert.equal(second.nextCursor, null); assertions++;
      assert.equal(new Set([...first.items, ...second.items].map((item) => item.id)).size, 15); assertions++;
      assert.ok(first.items.every((item) => !("document" in item))); assertions++;
      const constraints = [
        sql`update articles set status = 'unsafe' where id = ${draft.id}`,
        sql`update articles set published_at = null where id = ${draft.id}`,
        sql`update article_contents set document = '{}'::jsonb where article_id = ${draft.id}`,
      ];
      for (const query of constraints) {
        await assert.rejects(tx.transaction(async (nested) => { await nested.execute(query); })); assertions++;
      }
      const permissions = await tx.execute(sql`select relname, relrowsecurity, has_table_privilege('anon', oid, 'SELECT') as anon_select, has_table_privilege('authenticated', oid, 'SELECT') as authenticated_select from pg_class where relnamespace = ${sandbox}::regnamespace and relkind = 'r' and relname <> 'user'`);
      assert.equal(permissions.length, 4); assertions++;
      for (const table of permissions) {
        assert.equal(table.relrowsecurity, true);
        assert.equal(table.anon_select, false);
        assert.equal(table.authenticated_select, false);
        assertions += 3;
      }
      throw rollback;
    });
  } catch (error) {
    if (error !== rollback) throw error;
  }
  const [remaining] = await client`select to_regnamespace(${sandbox}) is null as removed`;
  assert.equal(remaining.removed, true); assertions++;
  console.log(JSON.stringify({ result: "passed", assertions, isolatedSchemaRolledBack: true, publicWrites: false }));
} catch (error) {
  console.error(JSON.stringify({ result: "failed", name: error.name, code: error.code, assertion: error instanceof assert.AssertionError ? error.message : undefined, causeCode: error.cause?.code }));
  process.exitCode = 1;
} finally {
  await client.end();
}
}
