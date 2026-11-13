import assert from "node:assert/strict";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { authOptions } from "../lib/auth/options.ts";

test("profile updates validate input and preserve account ownership", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://avatar-test.supabase.co";
  process.env.SUPABASE_AVATAR_BUCKET = "avatars";
  const auth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: "profile-update-test-secret-at-least-32-characters",
    database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
    ...authOptions,
    rateLimit: { enabled: false },
    logger: { disabled: true },
  });

  async function post(path, body, cookie) {
    return auth.handler(new Request(`http://localhost:3000/api/auth/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    }));
  }

  const signedUp = await post("sign-up/email", {
    name: "Original", email: "profile@example.test", password: "Test-profile-12345",
  });
  assert.equal(signedUp.status, 200);
  const cookie = signedUp.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  assert.ok(cookie);

  assert.equal((await post("update-user", { name: "Anonymous" })).status, 401);
  assert.equal((await post("update-user", { name: "Unverified" }, cookie)).status, 200);
  for (const body of [
    { name: "   " }, { name: "a".repeat(81) }, { name: 123 }, {},
    { name: "Injected", id: "another-user" },
    { name: "Injected", email: "other@example.test" },
    { image: "data:image/png;base64,AAAA" },
  ]) {
    assert.equal((await post("update-user", body, cookie)).status, 400);
  }

  assert.equal((await post("update-user", { name: "  新姓名  " }, cookie)).status, 200);
  const sessionResponse = await auth.handler(new Request("http://localhost:3000/api/auth/get-session", {
    headers: { Cookie: cookie },
  }));
  const session = await sessionResponse.json();
  assert.equal(session.user.name, "新姓名");
  assert.equal(session.user.email, "profile@example.test");
  const image = "https://avatar-test.supabase.co/storage/v1/object/public/avatars/" + session.user.id + "/12345678-1234-4234-8234-123456789abc.png";
  for (const invalid of [
    image.replace(session.user.id, "another-user"), image.replace("avatar-test.supabase.co", "attacker.test"),
    image + "?download=1", image.replace("avatars/", "other-bucket/"),
    image.replace("12345678-1234-4234-8234-123456789abc.png", "../other/avatar.png"),
    "javascript:alert(1)", "data:image/png;base64,AAAA",
  ]) assert.equal((await post("update-user", { image: invalid }, cookie)).status, 400);
  assert.equal((await post("update-user", { image }, cookie)).status, 200);
  const updated = await (await auth.handler(new Request("http://localhost:3000/api/auth/get-session", { headers: { Cookie: cookie } }))).json();
  assert.equal(updated.user.image, image);
  assert.equal(updated.user.name, "新姓名");
  assert.equal((await post("update-user", { image: null }, cookie)).status, 200);
  assert.equal((await post("change-email", { newEmail: "other@example.test" }, cookie)).status, 400);
});
