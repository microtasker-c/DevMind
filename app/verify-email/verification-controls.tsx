"use client";

import { Button } from "@heroui/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";

export function VerificationControls({ email, returnTo }: { email: string; returnTo: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"send" | "check" | null>("send");
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const initialSendStarted = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const resend = useCallback(async () => {
    setPending("send"); setError(""); setMessage("");
    try {
      const callbackURL = new URL(`/verify-email?returnTo=${encodeURIComponent(returnTo)}`, window.location.origin).href;
      const result = await authClient.sendVerificationEmail({ email, callbackURL });
      if (result.error) {
        if (result.error.status === 429) {
          setCooldown(60);
          setError("发送过于频繁，请等待一分钟后重试。");
        } else if (result.error.code === "EMAIL_SERVICE_NOT_CONFIGURED") {
          setError("邮件服务暂未启用，请联系管理员完成配置后重试。");
        } else setError("验证邮件发送失败，请稍后重试；若持续失败，请联系管理员检查邮件服务。");
        return;
      }
      setCooldown(60);
      setMessage("验证邮件已发送，请检查收件箱。");
    } catch {
      setError("网络连接失败，请检查网络后重试。");
    } finally { setPending(null); }
  }, [email, returnTo]);

  useEffect(() => {
    // Keep one request across Strict Mode's effect replay. A real remount is rate limited server-side.
    if (initialSendStarted.current) return;
    initialSendStarted.current = true;
    void resend();
  }, [resend]);

  async function checkVerification() {
    setPending("check"); setError(""); setMessage("");
    try {
      const result = await authClient.getSession({ query: { disableCookieCache: true } });
      if (result.error) { setError("暂时无法检查验证状态，请稍后重试。"); return; }
      if (!result.data) { router.replace(`/auth/sign-in?redirectTo=${encodeURIComponent(returnTo)}` as Route); return; }
      if (result.data.user.emailVerified) { router.replace(returnTo as Route); router.refresh(); return; }
      setMessage("邮箱尚未验证，请先打开邮件中的验证链接。");
    } catch {
      setError("网络连接失败，请检查网络后重试。");
    } finally { setPending(null); }
  }

  return (
    <div className="mt-6 space-y-3">
      <Button className="w-full" isDisabled={pending !== null} onPress={checkVerification}>
        {pending === "check" ? "正在检查…" : "我已验证，继续"}
      </Button>
      <Button className="w-full" variant="secondary" isDisabled={pending !== null || cooldown > 0} onPress={resend}>
        {pending === "send" ? "正在发送…" : cooldown > 0 ? `${cooldown} 秒后可重发` : "重新发送验证邮件"}
      </Button>
      {pending === "send" && <p className="text-sm leading-6 text-muted" role="status">正在发送验证邮件，请稍候…</p>}
      {message && <p className="text-sm leading-6 text-muted" role="status">{message}</p>}
      {error && <p className="text-sm leading-6 text-danger" role="alert">{error}</p>}
    </div>
  );
}
