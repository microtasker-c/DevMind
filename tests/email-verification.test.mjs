import assert from "node:assert/strict";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { createEmailVerificationOptions } from "../lib/auth/email-options.ts";
import { sendVerificationEmail } from "../lib/auth/email.ts";

test("missing mail configuration is distinguishable from delivery failure", async () => {
  const options = createEmailVerificationOptions((message) => sendVerificationEmail(message, {}));
  await assert.rejects(options.sendVerificationEmail({ user: { email: "verify@example.test" }, url: "http://localhost:3000/?token=private" }), (error) => {
    assert.equal(error.status, "SERVICE_UNAVAILABLE");
    assert.equal(error.body.code, "EMAIL_SERVICE_NOT_CONFIGURED");
    assert.equal(error.body.message, "邮件服务暂未启用，请联系管理员完成配置后重试。");
    return true;
  });
});

test("registration preserves a limited session and explicit verification send reports success", async () => {
  const messages = [];
  const auth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: "email-verification-test-secret-at-least-32-characters",
    database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
    emailAndPassword: { enabled: true },
    emailVerification: createEmailVerificationOptions(async (message) => { messages.push(message); }),
    rateLimit: { enabled: false }, logger: { disabled: true },
  });
  const response = await auth.handler(new Request("http://localhost:3000/api/auth/sign-up/email", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
    body: JSON.stringify({ name: "Reader", email: "verify@example.test", password: "Test-verification-12345", callbackURL: "http://localhost:3000/verify-email?returnTo=%2Fwrite" }),
  }));
  assert.equal(response.status, 200);
  const cookie = response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  assert.ok(cookie);
  assert.equal(messages.length, 0);
  const getSession = async () => (await auth.handler(new Request("http://localhost:3000/api/auth/get-session?disableCookieCache=true", { headers: { Cookie: cookie } }))).json();
  assert.equal((await getSession()).user.emailVerified, false);
  const resend = await auth.handler(new Request("http://localhost:3000/api/auth/send-verification-email", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:3000", Cookie: cookie },
    body: JSON.stringify({ email: "verify@example.test", callbackURL: "http://localhost:3000/verify-email?returnTo=%2Fwrite" }),
  }));
  assert.equal(resend.status, 200);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].user.email, "verify@example.test");
  const verified = await auth.handler(new Request(messages[0].url, { headers: { Cookie: cookie } }));
  assert.equal(verified.status, 302);
  assert.equal((await getSession()).user.emailVerified, true);
  const replay = await auth.handler(new Request(messages[0].url, { headers: { Cookie: cookie } }));
  assert.equal(replay.status, 302);
});

test("Resend delivery requires configuration and does not expose provider errors", async () => {
  const message = { user: { email: "verify@example.test" }, url: "http://localhost:3000/api/auth/verify-email?token=private" };
  await assert.rejects(sendVerificationEmail(message, { apiKey: "", from: "" }), /邮件服务尚未配置/);
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (_url, options) => {
      const body = JSON.parse(options.body);
      assert.equal(body.to[0], "verify@example.test");
      assert.match(body.text, /token=private/);
      return new Response(JSON.stringify({ message: "secret provider failure" }), { status: 403 });
    };
    await assert.rejects(sendVerificationEmail(message, { apiKey: "test-only-key", from: "Dev-Mind <mail@example.test>" }), (error) => {
      assert.match(error.message, /验证邮件发送失败/);
      assert.doesNotMatch(error.message, /secret|private|test-only-key/);
      return true;
    });
  } finally { globalThis.fetch = originalFetch; }
});

test("Resend network failures are reported without exposing request secrets", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new Error("network secret token=private"); };
    await assert.rejects(sendVerificationEmail({ user: { email: "verify@example.test" }, url: "http://localhost:3000/?token=private" }, { apiKey: "test-only-key", from: "mail@example.test" }), (error) => {
      assert.match(error.message, /邮件服务暂时无法连接/);
      assert.doesNotMatch(error.message, /secret|private|test-only-key/);
      return true;
    });
  } finally { globalThis.fetch = originalFetch; }
});

test("authentication responses do not expose failed mail provider details", async () => {
  const originalFetch = globalThis.fetch;
  let deliveries = 0;
  try {
    globalThis.fetch = async () => { deliveries++; return new Response("private-provider-token", { status: 403 }); };
    const auth = betterAuth({
      baseURL: "http://localhost:3000", secret: "failed-verification-test-secret-at-least-32-characters",
      database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
      emailAndPassword: { enabled: true },
      emailVerification: createEmailVerificationOptions((message) => sendVerificationEmail(message, { apiKey: "private-api-key", from: "mail@example.test" })),
      rateLimit: { enabled: false }, logger: { disabled: true },
    });
    const response = await auth.handler(new Request("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
      body: JSON.stringify({ name: "Reader", email: "failure@example.test", password: "Test-verification-12345" }),
    }));
    assert.equal(response.status, 200);
    assert.equal(deliveries, 0);
    assert.doesNotMatch(await response.text(), /private-provider-token|private-api-key|token=/);
    const cookie = response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
    const resend = await auth.handler(new Request("http://localhost:3000/api/auth/send-verification-email", {
      method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:3000", Cookie: cookie },
      body: JSON.stringify({ email: "failure@example.test" }),
    }));
    assert.equal(resend.status, 503);
    assert.equal(deliveries, 1);
    assert.doesNotMatch(await resend.text(), /private-provider-token|private-api-key|token=/);
  } finally { globalThis.fetch = originalFetch; }
});
