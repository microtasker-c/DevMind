import assert from "node:assert/strict";
import { test } from "node:test";
import { createAvatarUploadHandler } from "../lib/avatars/upload-handler.ts";
import { AVATAR_MAX_BYTES } from "../lib/avatars/config.ts";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf1sAAAAASUVORK5CYII=", "base64");
function request(file = new File([png], "avatar.png", { type: "image/png" }), origin = "http://localhost:3000") {
  const form = new FormData();
  form.set("file", file);
  return new Request("http://localhost:3000/api/account/avatar", { method: "POST", headers: { Origin: origin }, body: form });
}

test("avatar uploads reject anonymous, cross-origin, oversized and disguised files", async () => {
  const uploads = [];
  let signedIn = false;
  const handler = createAvatarUploadHandler({
    getSession: async () => signedIn ? { user: { id: "current-user" } } : null,
    upload: async (file, path) => { uploads.push({ file, path }); return "https://example.supabase.co/" + path; },
  });
  assert.equal((await handler(request())).status, 401);
  signedIn = true;
  assert.equal((await handler(request(undefined, "https://attacker.test"))).status, 403);
  for (const file of [
    new File(["fake"], "fake.png", { type: "image/png" }),
    new File(["<svg></svg>"], "avatar.svg", { type: "image/svg+xml" }),
    new File([], "empty.png", { type: "image/png" }),
  ]) assert.equal((await handler(request(file))).status, 400);
  assert.equal((await handler(request(new File([new Uint8Array(AVATAR_MAX_BYTES + 1)], "big.png", { type: "image/png" })))).status, 413);
  assert.equal(uploads.length, 0);
  const response = await handler(request());
  assert.equal(response.status, 200);
  assert.match(uploads[0].path, /^current-user\/[0-9a-f-]{36}\.png$/);
  assert.deepEqual(Buffer.from(await uploads[0].file.arrayBuffer()), png);
  assert.equal((await response.json()).url, "https://example.supabase.co/" + uploads[0].path);
  assert.equal((await handler(request())).status, 200);
  assert.notEqual(uploads[0].path, uploads[1].path);
});

test("body size is bounded without relying on Content-Length", async () => {
  let called = false;
  const handler = createAvatarUploadHandler({
    getSession: async () => ({ user: { id: "user" } }),
    upload: async () => { called = true; return "unused"; },
  });
  const oversized = request(new File([new Uint8Array(AVATAR_MAX_BYTES + 70_000)], "big.png", { type: "image/png" }));
  oversized.headers.delete("content-length");
  assert.equal((await handler(oversized)).status, 413);
  assert.equal(called, false);
});

test("storage failures are explicit and repeated uploads are rate limited", async () => {
  const handler = createAvatarUploadHandler({
    getSession: async () => ({ user: { id: "user" } }),
    upload: async () => { throw new Error("private storage credential must not be returned"); },
  });
  for (let i = 0; i < 10; i += 1) {
    const response = await handler(request());
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /private storage credential/);
  }
  assert.equal((await handler(request())).status, 429);
});
