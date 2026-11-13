import { auth } from "@/lib/auth";
import { uploadAvatar } from "@/lib/avatars/storage";
import { createAvatarUploadHandler } from "@/lib/avatars/upload-handler";

export const runtime = "nodejs";

export const POST = createAvatarUploadHandler({
  getSession: (headers) => auth.api.getSession({ headers, query: { disableCookieCache: true } }),
  upload: uploadAvatar,
});
