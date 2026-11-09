import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/lib/db/client";
import { authOptions } from "./options";

export const auth = betterAuth({
  appName: "Dev-Mind",
  database: drizzleAdapter(getDb(), { provider: "pg" }),
  ...authOptions,
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
