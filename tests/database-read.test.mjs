import assert from "node:assert/strict";
import { test } from "node:test";
import { retryDatabaseRead } from "../lib/db/read.ts";
import { getArticle, getOwnedArticle, listArticles, listMyArticles } from "../lib/articles/queries.ts";

const timeout = () => Object.assign(new Error("connection timed out"), { code: "CONNECT_TIMEOUT" });

test("read reconnects once after a timeout wrapped by Drizzle", async (t) => {
  const warn = t.mock.method(console, "warn", () => {});
  let attempts = 0;
  const result = await retryDatabaseRead(async () => {
    if (++attempts === 1) throw new Error("Failed query", { cause: timeout() });
    return { id: "article" };
  });
  assert.deepEqual(result, { id: "article" });
  assert.equal(attempts, 2);
  assert.equal(warn.mock.callCount(), 1);
});

test("persistent timeout stops after one retry and propagates the last failure", async (t) => {
  t.mock.method(console, "warn", () => {});
  let attempts = 0;
  const failure = timeout();
  await assert.rejects(retryDatabaseRead(async () => {
    attempts++;
    throw failure;
  }), (error) => error === failure);
  assert.equal(attempts, 2);
});

test("SQL, permission and authentication errors are not retried", async () => {
  for (const code of ["42601", "42501", "28P01", "ECONNRESET"]) {
    let attempts = 0;
    const failure = new Error("Failed query", { cause: Object.assign(new Error("failure"), { code }) });
    await assert.rejects(retryDatabaseRead(async () => {
      attempts++;
      throw failure;
    }), (error) => error === failure);
    assert.equal(attempts, 1);
  }
});

test("malformed and cyclic error causes propagate without looping", async () => {
  const cyclic = new Error("cyclic cause");
  cyclic.cause = cyclic;
  for (const failure of [cyclic, null, "failure"]) {
    await assert.rejects(retryDatabaseRead(async () => { throw failure; }), (error) => error === failure);
  }
});

test("article reads never replay a caller-owned transaction", async () => {
  const id = "7be08029-54a2-4264-8a6d-42996876eb1a";
  for (const read of [
    (db) => getArticle(id, db),
    (db) => getOwnedArticle(id, "author", db),
    (db) => listArticles({}, db),
    (db) => listMyArticles("author", db),
  ]) {
    let attempts = 0;
    const failure = timeout();
    const db = { select() { attempts++; throw failure; } };
    await assert.rejects(read(db), (error) => error === failure);
    assert.equal(attempts, 1);
  }
});

test("development module reloads reuse the existing database pool", async () => {
  const previousUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  const first = await import("../lib/db/client.ts?reload=first");
  const second = await import("../lib/db/client.ts?reload=second");
  try {
    assert.strictEqual(first.getDb(), second.getDb());
  } finally {
    await first.getDb().$client.end();
    delete globalThis.devMindDatabase;
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
  }
});
