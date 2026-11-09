import assert from "node:assert/strict";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { authOptions } from "../lib/auth/options.ts";

test("email signup and password login work while verification and recovery endpoints are disabled", async () => {
  const auth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: "paused-email-flows-test-secret-at-least-32-characters",
    database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
    ...authOptions,
    rateLimit: { enabled: false }, logger: { disabled: true },
  });
  const post = (path, body, cookie = "") => auth.handler(new Request(`http://localhost:3000/api/auth/${path}`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:3000", Cookie: cookie },
    body: JSON.stringify(body),
  }));
  const email = "reader@example.test";
  const password = "Test-paused-email-12345";
  const response = await post("sign-up/email", { name: "Reader", email, password });
  assert.equal(response.status, 200);
  const cookie = response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  assert.ok(cookie);
  const session = await (await auth.handler(new Request("http://localhost:3000/api/auth/get-session", {
    headers: { Cookie: cookie },
  }))).json();
  assert.equal(session.user.emailVerified, false);

  for (const [path, body] of [
    ["send-verification-email", { email }],
    ["request-password-reset", { email, redirectTo: "http://localhost:3000/auth/reset-password" }],
    ["reset-password", { token: "old-token", newPassword: "Changed-password-12345" }],
  ]) {
    assert.equal((await post(path, body, cookie)).status, 404, path);
  }
  for (const path of ["verify-email?token=old-token", "reset-password/old-token?callbackURL=http%3A%2F%2Flocalhost%3A3000"]) {
    assert.equal((await auth.handler(new Request(`http://localhost:3000/api/auth/${path}`, {
      headers: { Cookie: cookie },
    }))).status, 404, path);
  }

  assert.equal((await post("sign-out", {}, cookie)).status, 200);
  assert.equal((await post("sign-in/email", { email, password })).status, 200);
  assert.equal((await post("sign-in/email", { email, password: "Wrong-password-12345" })).status, 401);
});
