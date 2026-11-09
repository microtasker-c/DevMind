import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, "姓名不能为空").max(80, "姓名不能超过 80 个字符"),
}).strict();

export const validateAuthRequest = createAuthMiddleware(async (ctx) => {
  // Includes the token callback route, which disabledPaths does not pattern-match.
  if (/^\/(?:send-verification-email|verify-email|request-password-reset|reset-password)(?:\/|$)/u.test(ctx.path)) {
    throw new APIError("NOT_FOUND", { message: "此功能暂未开放" });
  }
  if (ctx.path !== "/update-user") return;

  const session = await getSessionFromCtx(ctx, { disableCookieCache: true });
  if (!session) throw new APIError("UNAUTHORIZED", { message: "请先登录" });

  const result = profileUpdateSchema.safeParse(ctx.body);
  if (!result.success) {
    throw new APIError("BAD_REQUEST", {
      message: result.error.issues[0]?.message ?? "仅支持修改姓名",
    });
  }

  // Better Auth retains session authorization, origin checks and cookie updates.
  return { context: { body: result.data } };
});
