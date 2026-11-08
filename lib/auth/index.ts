import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/lib/db/client";

export const auth = betterAuth({
  appName: "Dev-Mind",
  database: drizzleAdapter(getDb(), { provider: "pg" }),
  emailAndPassword: { enabled: true },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
