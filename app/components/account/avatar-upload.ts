"use client";

import { resizeAvatar } from "@better-auth-ui/core";
import { z } from "zod";
import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES } from "@/lib/avatars/config";

export const avatarConfig = {
  enabled: true,
  size: 256,
  extension: "png" as const,
  async resize(file: File) {
    if (!AVATAR_MIME_TYPES.includes(file.type)) {
      throw new Error("请选择 PNG、JPEG 或 WebP 图片");
    }
    if (file.size > AVATAR_MAX_BYTES) throw new Error("图片不能超过 2 MB");
    return resizeAvatar(file, 256, "png");
  },
  async upload(file: File) {
    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/account/avatar", {
      method: "POST", body: form, signal: AbortSignal.timeout(45_000),
    });
    const body: unknown = await response.json();
    if (!response.ok) {
      const result = z.object({ message: z.string() }).safeParse(body);
      throw new Error(result.success ? result.data.message : "头像上传失败，请重试");
    }
    return z.object({ url: z.url() }).parse(body).url;
  },
};
