import type { BetterAuthOptions } from "better-auth";
import { validateAuthRequest } from "./profile-validation";

// Email ownership verification and password recovery are paused in this release.
export const authOptions = {
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  disabledPaths: ["/send-verification-email", "/verify-email", "/request-password-reset", "/reset-password"],
  rateLimit: { enabled: true },
  hooks: { before: validateAuthRequest },
} satisfies BetterAuthOptions;
