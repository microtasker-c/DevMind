import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("sidebar selection keeps desktop navigation open", () => {
  const source = read("app/components/home/sidebar.tsx");
  assert.doesNotMatch(source, /onSelect\(item\.label\);\s*onClose\(\);/);
});

test("article layout reuses the community navigation shell", () => {
  const source = read("app/components/articles/article-layout.tsx");
  assert.match(source, /CommunityShell/);
});

test("global loading UI uses a spinner instead of loading text", () => {
  const source = read("app/components/ui/loading.tsx");
  assert.match(source, /animate-spin/);
  assert.match(read("app/loading.tsx"), /<LoadingIndicator \/>/);
});
