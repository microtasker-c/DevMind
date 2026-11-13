"use client";

import { AuthProvider } from "@better-auth-ui/heroui";
import { QueryClient } from "@tanstack/react-query";
import { Toast } from "@heroui/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth/client";
import { accountSettingsPlugin } from "./components/account/read-only-email";
import { avatarConfig } from "./components/account/avatar-upload";
import { NavigationToastProvider } from "./components/ui/navigation-toast";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthProvider
      authClient={authClient}
      queryClient={queryClient}
      navigate={({ to, replace }) => (replace ? router.replace(to as Route) : router.push(to as Route))}
      redirectTo="/"
      avatar={avatarConfig}
      plugins={[accountSettingsPlugin]}
      localization={{
        auth: { name: "姓名", fieldRequired: "请填写此项" },
        settings: {
          settings: "Settings",
          userProfile: "个人资料",
          avatar: "头像",
          changeAvatar: "更换头像",
          uploadAvatar: "上传图片（PNG / JPEG / WebP，最大 2 MB）",
          deleteAvatar: "移除头像",
          avatarChangedSuccess: "头像已更新",
          avatarDeletedSuccess: "头像已移除",
          saveChanges: "保存更改",
          profileUpdatedSuccess: "个人资料已更新",
        },
        errors: { imageUploadFailed: "上传失败：请选择不超过 2 MB 的 PNG、JPEG 或 WebP 图片；若仍失败，请稍后重试" },
      }}
      emailAndPassword={{
        enabled: true,
        requireEmailVerification: false,
        forgotPassword: false,
        confirmPassword: true,
        name: true,
      }}
    >
      <NavigationToastProvider>{children}</NavigationToastProvider>
      <Toast.Provider placement="bottom end" />
    </AuthProvider>
  );
}
