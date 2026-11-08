"use client";

import { AuthProvider } from "@better-auth-ui/heroui";
import { QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth/client";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthProvider
      authClient={authClient}
      queryClient={queryClient}
      navigate={({ to, replace }) => (replace ? router.replace(to) : router.push(to))}
      redirectTo="/"
      emailAndPassword={{
        enabled: true,
        confirmPassword: true,
        name: true,
      }}
    >
      {children}
    </AuthProvider>
  );
}
