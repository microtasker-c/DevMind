import assert from "node:assert/strict";
import { test } from "node:test";
import { draftSnapshot } from "../app/components/articles/draft-snapshot.ts";

const fields = {
  title: "文章", excerpt: "摘要", coverUrl: "", tags: "React, TypeScript",
  document: [{ id: "first", type: "paragraph", content: [{ type: "text", text: "正文", styles: {} }] }],
};

test("unchanged content ignores generated block IDs, key order and tag separator spacing", () => {
  const reordered = {
    ...fields, tags: "React，TypeScript",
    document: [{ content: [{ styles: {}, text: "正文", type: "text" }], type: "paragraph", id: "regenerated" }],
  };
  assert.equal(draftSnapshot(reordered), draftSnapshot(fields));
});

test("every editable metadata field and body formatting counts as a change", () => {
  for (const key of ["title", "excerpt", "coverUrl", "tags"]) {
    assert.notEqual(draftSnapshot({ ...fields, [key]: "changed" }), draftSnapshot(fields));
  }
  for (const document of [
    [{ type: "paragraph", content: "不同正文" }],
    [{ type: "paragraph", content: [{ type: "text", text: "正文", styles: { bold: true } }] }],
    [{ type: "heading", props: { level: 2 }, content: "正文" }],
    [{ type: "paragraph", content: "正文", children: [{ type: "paragraph", content: "子段落" }] }],
  ]) assert.notEqual(draftSnapshot({ ...fields, document }), draftSnapshot(fields));
});

test("reverting to the original content restores the unchanged snapshot", () => {
  const original = draftSnapshot(fields);
  const document = structuredClone(fields.document);
  document[0].content[0].text = "编辑中";
  assert.notEqual(draftSnapshot({ ...fields, document }), original);
  document[0].content[0].text = "正文";
  assert.equal(draftSnapshot({ ...fields, document }), original);
});
