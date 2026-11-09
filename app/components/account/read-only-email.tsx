"use client";

import { useSession } from "@better-auth-ui/react";
import { Card, Description, Input, Label, Skeleton, TextField, type CardProps } from "@heroui/react";
import { authClient } from "@/lib/auth/client";

export function ReadOnlyEmail({ variant }: { variant?: CardProps["variant"] }) {
  const { data: session } = useSession(authClient);

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">登录邮箱</h2>
      <Card className="gap-4 p-4" variant={variant}>
        <Card.Content>
          <TextField isReadOnly value={session?.user.email ?? ""}>
            <Label>邮箱</Label>
            {session ? <Input type="email" variant="secondary" /> : <Skeleton className="h-10 w-full rounded-xl" />}
            <Description>当前邮箱用于登录，暂不支持修改。</Description>
          </TextField>
        </Card.Content>
      </Card>
    </section>
  );
}

export const accountSettingsPlugin = {
  id: "dev-mind-account-settings",
  cardOverrides: { account: { changeEmail: ReadOnlyEmail } },
};
