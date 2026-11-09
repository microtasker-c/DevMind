type VerificationMessage = { user: { email: string }; url: string };
type EmailConfig = { apiKey?: string; from?: string };

export class EmailConfigurationError extends Error {
  constructor() {
    super("邮件服务尚未配置，请联系管理员配置 Resend。");
    this.name = "EmailConfigurationError";
  }
}

export async function sendVerificationEmail(
  { user, url }: VerificationMessage,
  config: EmailConfig = { apiKey: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM },
): Promise<void> {
  if (!config.apiKey?.trim() || !config.from?.trim()) throw new EmailConfigurationError();
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: config.from,
        to: [user.email],
        subject: "验证你的 Dev-Mind 邮箱",
        text: `欢迎加入 Dev-Mind。\n\n请打开以下链接验证邮箱（1 小时内有效）：\n${url}\n\n如果这不是你的操作，请忽略此邮件。`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new Error("验证邮件发送失败，邮件服务暂时无法连接，请稍后重试。");
  }
  if (!response.ok) throw new Error("验证邮件发送失败，请稍后重试或联系管理员。");
}
