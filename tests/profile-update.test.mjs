import assert from "node:assert/strict";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { validateProfileUpdate } from "../lib/auth/profile-validation.ts";

test("profile updates validate input and preserve account ownership", async () => {
  const auth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: "profile-update-test-secret-at-least-32-characters",
    database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
    emailAndPassword: { enabled: true },
    emailVerification: {
      sendOnSignUp: false,
      sendVerificationEmail: async ({ url }) => { verificationUrl = url; },
    },
    hooks: { before: validateProfileUpdate },
    rateLimit: { enabled: false },
    logger: { disabled: true },
  });
  let verificationUrl;

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
  assert.equal((await post("update-user", { name: "Unverified" }, cookie)).status, 403);
  assert.equal((await post("send-verification-email", { email: "profile@example.test" }, cookie)).status, 200);
  assert.ok(verificationUrl);
  assert.equal((await auth.handler(new Request(verificationUrl, { headers: { Cookie: cookie } }))).status, 302);
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
  assert.equal((await post("change-email", { newEmail: "other@example.test" }, cookie)).status, 400);
});
