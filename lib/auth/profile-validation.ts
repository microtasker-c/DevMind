import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, "姓名不能为空").max(80, "姓名不能超过 80 个字符"),
}).strict();

export const validateProfileUpdate = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/update-user") return;

  const session = await getSessionFromCtx(ctx, { disableCookieCache: true });
  if (!session) throw new APIError("UNAUTHORIZED", { message: "请先登录" });
  if (!session.user.emailVerified) throw new APIError("FORBIDDEN", { message: "请先验证邮箱后再修改账户资料" });

  const result = profileUpdateSchema.safeParse(ctx.body);
  if (!result.success) {
    throw new APIError("BAD_REQUEST", {
      message: result.error.issues[0]?.message ?? "仅支持修改姓名",
    });
  }

  // Better Auth retains session authorization, origin checks and cookie updates.
  return { context: { body: result.data } };
});
