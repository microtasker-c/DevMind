import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const requireLink = createRequire(import.meta.resolve("@tiptap/extension-link"));

function createLink(extension) {
  extension.config.onCreate.call({ options: extension.options });
}

test("article links avoid protocol registration warnings across editor creation", async (t) => {
  const warnings = t.mock.method(console, "warn", () => {});
  // linkify captures console.warn at module load, so install the spy first.
  const linkify = requireLink("linkifyjs");
  const { Link } = await import("@tiptap/extension-link");
  const { articleLink } = await import("../app/components/articles/article-link.ts");
  linkify.reset();
  try {
    linkify.find("https://example.com");
    createLink(Link.configure({ protocols: ["http", "https", "mailto"] }));
    assert.ok(warnings.mock.calls.some(({ arguments: args }) => String(args[0]).includes("already initialized")));
    warnings.mock.resetCalls();
    for (let i = 0; i < 3; i++) {
      createLink(articleLink);
      assert.equal(linkify.find("https://example.com").length, 1);
      assert.equal(linkify.find("http://example.com").length, 1);
      assert.equal(linkify.find("mailto:reader@example.com").length, 1);
      articleLink.config.onDestroy.call({});
    }
    assert.equal(warnings.mock.callCount(), 0);
    assert.equal(articleLink.options.defaultProtocol, "https");
    assert.equal(articleLink.config.inclusive, false);
  } finally {
    linkify.reset();
  }
});
