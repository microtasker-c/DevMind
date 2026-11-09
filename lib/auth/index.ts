import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/lib/db/client";
import { validateProfileUpdate } from "./profile-validation";
import { createEmailVerificationOptions } from "./email-options";
import { sendVerificationEmail } from "./email";

export const auth = betterAuth({
  appName: "Dev-Mind",
  database: drizzleAdapter(getDb(), { provider: "pg" }),
  emailAndPassword: { enabled: true },
  emailVerification: createEmailVerificationOptions((message) => sendVerificationEmail(message)),
  rateLimit: {
    enabled: true,
    customRules: { "/send-verification-email": { window: 60, max: 1 } },
  },
  hooks: { before: validateProfileUpdate },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
