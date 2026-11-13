import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSaveArticle, parseCursor, encodeCursor } from "../lib/articles/validation.ts";
import { parseArticleDocument } from "../lib/articles/document-schema.ts";
import { requireArticleWriter, checkArticleEdit } from "../lib/articles/policy.ts";

const paragraph = (text) => ({ type: "paragraph", content: [{ type: "text", text, styles: {} }] });
const input = (changes = {}) => ({ title: "  测试文章  ", excerpt: "", coverUrl: "", tags: ["TypeScript"], status: "published", document: [paragraph("真实正文内容")], ...changes });

test("published articles require a title and meaningful body; drafts may be empty", () => {
  assert.throws(() => parseSaveArticle(input({ title: " " })), /标题/);
  assert.throws(() => parseSaveArticle(input({ document: [paragraph(" ")] })), /正文/);
  assert.equal(parseSaveArticle(input({ title: "", document: [paragraph("")], status: "draft" })).status, "draft");
});

test("optional cover accepts HTTP URLs and rejects executable or credential URLs", () => {
  assert.equal(parseSaveArticle(input()).coverUrl, null);
  assert.equal(parseSaveArticle(input({ coverUrl: "https://cdn.example.test/a.jpg" })).coverUrl, "https://cdn.example.test/a.jpg");
  for (const coverUrl of ["javascript:alert(1)", "data:image/png,a", "//example.test/a", "https://u:p@example.test/x"]) {
    assert.throws(() => parseSaveArticle(input({ coverUrl })), /封面/);
  }
});

test("server derives summary and read time and normalizes tags", () => {
  const value = parseSaveArticle(input({ tags: [" TypeScript ", "TypeScript", "数据库"] }));
  assert.equal(value.title, "测试文章");
  assert.equal(value.excerpt, "真实正文内容");
  assert.equal(value.readingMinutes, 1);
  assert.deepEqual(value.tags.map((tag) => tag.name), ["TypeScript", "数据库"]);
  assert.throws(() => parseSaveArticle(input({ tags: Array(6).fill("x") })), /标签/);
});

test("technical tag punctuation distinguishes C, C++, C# and .NET", () => {
  const tags = parseSaveArticle(input({ tags: ["C", "C++", "C#", ".NET"] })).tags;
  assert.deepEqual(tags.map((tag) => tag.name), ["C", "C++", "C#", ".NET"]);
  assert.deepEqual(tags.map((tag) => tag.slug), ["c", "c++", "c#", ".net"]);
  assert.equal(parseSaveArticle(input({ tags: ["C++", "c++"] })).tags.length, 1);
  assert.equal(parseSaveArticle(input({ tags: ["Ｃ＋＋"] })).tags[0].slug, "c++");
  assert.throws(() => parseSaveArticle(input({ tags: ["++#.."] })), /标签/);
  assert.throws(() => parseSaveArticle(input({ tags: ["㍿".repeat(20)] })), /标签规范化后过长/);
});

test("document parser supports the text-only BlockNote schema and rejects unknown data", () => {
  assert.equal(parseArticleDocument([{ type: "heading", props: { level: 2 }, content: "标题" }])[0].type, "heading");
  for (const document of [
    [{ type: "image", props: { url: "https://example.test/a.png" } }],
    [{ type: "paragraph", props: { unknown: "x" }, content: "text" }],
    [{ type: "paragraph", content: [{ type: "link", href: "javascript:alert(1)", content: "x" }] }],
    [{ type: "paragraph", content: [{ type: "text", text: "a", styles: { textColor: "url(https://bad.test)" } }] }],
    [{ type: "heading", props: { level: 9 }, content: "x" }],
    [{ type: "paragraph", content: "x", html: "<script>" }],
    [{ id: "same", ...paragraph("a") }, { id: "same", ...paragraph("b") }],
  ]) assert.throws(() => parseArticleDocument(document), /正文/);
});

test("document parser bounds size, depth and counts before recursive validation", () => {
  assert.throws(() => parseArticleDocument([paragraph("x".repeat(600_000))]), /正文/);
  assert.throws(() => parseArticleDocument(Array.from({ length: 1001 }, () => paragraph("x"))), /正文/);
  let block = paragraph("x");
  for (let i = 0; i < 15; i++) block = { ...paragraph("x"), children: [block] };
  assert.throws(() => parseArticleDocument([block]), /正文/);
});

test("serialized BlockNote 0.41 default props roundtrip for each supported block", () => {
  const standard = { backgroundColor: "default", textColor: "default", textAlignment: "left" };
  const content = [{ type: "text", text: "BlockNote 正文", styles: {} }];
  const fixture = [
    { id: "paragraph", type: "paragraph", props: standard, content, children: [] },
    { id: "heading", type: "heading", props: { ...standard, level: 2 }, content, children: [] },
    { id: "bulletListItem", type: "bulletListItem", props: standard, content, children: [] },
    { id: "numberedListItem", type: "numberedListItem", props: standard, content, children: [] },
    { id: "checkListItem", type: "checkListItem", props: { ...standard, checked: false }, content, children: [] },
    { id: "quote", type: "quote", props: { backgroundColor: "default", textColor: "default" }, content, children: [] },
    { id: "codeBlock", type: "codeBlock", props: { language: "text" }, content, children: [] },
    { id: "divider", type: "divider", props: {}, children: [] },
  ];
  assert.deepEqual(parseArticleDocument(fixture), fixture);
  assert.deepEqual(parseArticleDocument(JSON.parse(JSON.stringify(fixture))), fixture);
});

test("cursor validates exact timestamp and UUID and does not accept arbitrary SQL input", () => {
  const cursor = { id: "00000000-0000-4000-8000-000000000001", publishedAt: "2026-11-09T00:00:00.000Z" };
  assert.deepEqual(parseCursor(encodeCursor(cursor)), cursor);
  for (const value of ["' OR 1=1", Buffer.from(JSON.stringify({ ...cursor, id: "bad" })).toString("base64url")]) {
    assert.throws(() => parseCursor(value), /分页/);
  }
});

test("write policy allows draft edits and publishing but locks published articles", () => {
  assert.throws(() => requireArticleWriter(null), /登录/);
  assert.equal(requireArticleWriter({ user: { id: "a", emailVerified: false } }), "a");
  assert.equal(requireArticleWriter({ user: { id: "a", emailVerified: true } }), "a");
  const article = { authorId: "a", revision: 2, status: "published" };
  assert.throws(() => checkArticleEdit(article, "b", 2), /不存在/);
  assert.throws(() => checkArticleEdit(article, "a", 1), /更新/);
  assert.throws(() => checkArticleEdit(article, "a", 2), /已发布/);
  assert.throws(() => checkArticleEdit(article, "a", 2), /已发布.*不可编辑/);
  const draft = { ...article, status: "draft" };
  assert.doesNotThrow(() => checkArticleEdit(draft, "a", 2));
  assert.throws(() => checkArticleEdit(draft, "a", 1), /更新/);
});
