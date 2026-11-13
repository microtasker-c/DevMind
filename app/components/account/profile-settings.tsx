"use client";

import { updateUserOptions } from "@better-auth-ui/core";
import { UserAvatar } from "@better-auth-ui/heroui";
import { useSession } from "@better-auth-ui/react";
import { Button, Card, Description, FieldError, Input, Label, Spinner, TextField, toast } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES } from "@/lib/avatars/config";
import { avatarConfig } from "./avatar-upload";
import { ReadOnlyEmail } from "./read-only-email";

type ProfileChange = { name: string; file?: File };

export function ProfileSettings() {
  const { data: session } = useSession(authClient);
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [editedName, setEditedName] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string>();
  const [selectedAvatar, setSelectedAvatar] = useState<{ file: File; url: string } | null>(null);
  const previewUrl = selectedAvatar?.url;
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);
  const name = editedName ?? session?.user.name ?? "";
  const defaults = updateUserOptions(authClient);
  const update = useMutation({
    mutationKey: defaults.mutationKey,
    // This form owns error feedback; avoid a second toast from ErrorToaster.
    meta: { ...defaults.meta, errorPresentation: "inline" },
    mutationFn: async (change: ProfileChange) => {
      const image = change.file
        ? await avatarConfig.upload(await avatarConfig.resize(change.file))
        : undefined;
      return authClient.updateUser({
        name: change.name,
        ...(image !== undefined && { image }),
        fetchOptions: { throw: true },
      });
    },
    onSuccess: () => {
      setEditedName(null);
      setSelectedAvatar(null);
      toast.success("个人资料保存成功", { timeout: 4000 });
      // Clear previously visited/prefetched server pages containing author details.
      router.refresh();
    },
    onError: (error) => {
      toast.danger(error.message || "保存失败，请稍后重试", { timeout: 5000 });
    },
  });

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = name.trim();
    if (!value || value.length > 80) {
      const message = value ? "姓名不能超过 80 个字符" : "姓名不能为空";
      setNameError(message);
      toast.danger(message, { timeout: 5000 });
      return;
    }
    setNameError(undefined);
    update.mutate({ name: value, file: selectedAvatar?.file });
  }

  function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!AVATAR_MIME_TYPES.includes(file.type) || file.size === 0 || file.size > AVATAR_MAX_BYTES) {
      toast.danger("请选择不超过 2 MB 的 PNG、JPEG 或 WebP 图片", { timeout: 5000 });
      return;
    }
    setSelectedAvatar({ file, url: URL.createObjectURL(file) });
  }

  const disabled = !session || update.isPending;
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="mb-3 text-sm font-semibold">个人资料</h2>
        <Card className="gap-4 p-4">
          <Card.Content>
            <div className="mb-4 flex flex-col gap-2">
              <Label htmlFor="profile-avatar">头像</Label>
              <input id="profile-avatar" ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={disabled} onChange={selectAvatar} />
              <div className="flex flex-wrap items-center gap-4">
                <UserAvatar size="lg" user={session ? { ...session.user, image: previewUrl ?? session.user.image } : undefined} />
                <Button type="button" variant="secondary" size="sm" isDisabled={disabled} onPress={() => fileInput.current?.click()}>更换头像</Button>
              </div>
              <p className="text-xs text-muted">支持 PNG、JPEG、WebP，最大 2 MB。点击“保存更改”后生效。</p>
              {selectedAvatar && <p className="text-xs text-muted" role="status">新头像尚未保存。</p>}
            </div>
            <form noValidate onSubmit={saveProfile} className="flex flex-col gap-4">
              <TextField name="name" value={name} isDisabled={disabled} isInvalid={Boolean(nameError)} onChange={(value) => { setEditedName(value); setNameError(undefined); }}>
                <Label>姓名</Label>
                <Input autoComplete="name" variant="secondary" />
                <Description>你在社区中展示的名字。</Description>
                {nameError && <FieldError>{nameError}</FieldError>}
              </TextField>
              <Button type="submit" size="sm" className="self-start" isDisabled={disabled}>
                {update.isPending && <Spinner size="sm" />}
                {update.isPending ? "保存中…" : "保存更改"}
              </Button>
            </form>
          </Card.Content>
        </Card>
      </section>
      <ReadOnlyEmail />
    </div>
  );
}
