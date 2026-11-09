"use client";

import { AuthProvider } from "@better-auth-ui/heroui";
import { QueryClient } from "@tanstack/react-query";
import { Toast } from "@heroui/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth/client";
import { accountSettingsPlugin } from "./components/account/read-only-email";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthProvider
      authClient={authClient}
      queryClient={queryClient}
      navigate={({ to, replace }) => (replace ? router.replace(to as Route) : router.push(to as Route))}
      redirectTo="/"
      avatar={{ enabled: false }}
      plugins={[accountSettingsPlugin]}
      localization={{
        auth: { name: "姓名", fieldRequired: "请填写此项" },
        settings: {
          settings: "Settings",
          userProfile: "个人资料",
          saveChanges: "保存更改",
          profileUpdatedSuccess: "个人资料已更新",
        },
      }}
      emailAndPassword={{
        enabled: true,
        requireEmailVerification: false,
        forgotPassword: false,
        confirmPassword: true,
        name: true,
      }}
    >
      {children}
      <Toast.Provider />
    </AuthProvider>
  );
}
