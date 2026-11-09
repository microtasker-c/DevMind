import assert from "node:assert/strict";
import { test } from "node:test";
import { getAccessDecision, safeReturnTo } from "../lib/auth/access.ts";

test("private routes distinguish anonymous, unverified and verified accounts", () => {
  assert.equal(getAccessDecision(null, "/write"), "/auth/sign-in?redirectTo=%2Fwrite");
  assert.equal(getAccessDecision({ user: { emailVerified: false } }, "/write"), "/verify-email?returnTo=%2Fwrite");
  assert.equal(getAccessDecision({ user: { emailVerified: true } }, "/write"), null);
});

test("return destinations cannot leave the site or loop through authentication", () => {
  for (const input of [undefined, "https://evil.test", "//evil.test", "/\\evil.test", "/%5cevil.test", "/auth/sign-in", "/%61uth/sign-in", "/verify-email", "/api/auth/sign-out", "/a\n"]) {
    assert.equal(safeReturnTo(input), "/", String(input));
  }
  assert.equal(safeReturnTo("/articles/abc/edit?x=1"), "/articles/abc/edit?x=1");
});
