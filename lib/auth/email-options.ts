import type { BetterAuthOptions } from "better-auth";
import { APIError } from "better-auth/api";
import { EmailConfigurationError } from "./email";

type SendVerificationEmail = NonNullable<NonNullable<BetterAuthOptions["emailVerification"]>["sendVerificationEmail"]>;

export function createEmailVerificationOptions(send: SendVerificationEmail): NonNullable<BetterAuthOptions["emailVerification"]> {
  return {
    sendVerificationEmail: async (message, request) => {
      try {
        await send(message, request);
      } catch (error) {
        if (error instanceof EmailConfigurationError) {
          throw new APIError("SERVICE_UNAVAILABLE", {
            code: "EMAIL_SERVICE_NOT_CONFIGURED",
            message: "邮件服务暂未启用，请联系管理员完成配置后重试。",
          });
        }
        throw new APIError("SERVICE_UNAVAILABLE", { message: "验证邮件发送失败，请稍后重试或联系管理员。" });
      }
    },
    // The verification page sends through the awaited endpoint so failures reach the user.
    sendOnSignUp: false,
    sendOnSignIn: false,
    autoSignInAfterVerification: false,
    expiresIn: 60 * 60,
  };
}
