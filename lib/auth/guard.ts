import { headers } from "next/headers";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { auth, type AuthSession } from "./index";
import { getAccessDecision } from "./access";

export async function getAuthoritativeSession() {
  return auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
}

export async function requireSession(returnTo: string): Promise<AuthSession> {
  const session = await getAuthoritativeSession();
  const destination = getAccessDecision(session, returnTo);
  if (destination) redirect(destination as Route);
  if (!session) throw new Error("登录会话不存在");
  return session;
}
