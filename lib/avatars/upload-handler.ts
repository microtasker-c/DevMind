import { randomUUID } from "node:crypto";
import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES } from "./config";

type Dependencies = {
  getSession: (headers: Headers) => Promise<{ user: { id: string } } | null>;
  upload: (file: File, path: string) => Promise<string>;
};

const MAX_BODY_BYTES = AVATAR_MAX_BYTES + 64 * 1024;

function error(message: string, status: number) {
  return Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function readForm(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(chunk.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new Response(bytes, { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
}

async function hasImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "image/png") {
    return [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  }
  if (file.type === "image/jpeg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  return bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF"
    && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
}

export function createAvatarUploadHandler({ getSession, upload }: Dependencies) {
  const attempts = new Map<string, { count: number; expires: number }>();

  return async function POST(request: Request) {
    // Cookie authentication alone does not protect a multipart endpoint from CSRF.
    if (request.headers.get("origin") !== new URL(request.url).origin) {
      return error("请求来源无效，请刷新页面后重试", 403);
    }
    try {
      const session = await getSession(request.headers);
      if (!session) return error("请先登录", 401);

      const now = Date.now();
      for (const [id, value] of attempts) if (value.expires <= now) attempts.delete(id);
      const attempt = attempts.get(session.user.id) ?? { count: 0, expires: now + 60_000 };
      if (attempt.count >= 10) return error("头像上传过于频繁，请一分钟后重试", 429);
      attempt.count += 1;
      attempts.set(session.user.id, attempt);

      if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) {
        return error("请上传图片文件", 400);
      }
      if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
        return error("图片不能超过 2 MB", 413);
      }
      let form: FormData | null;
      try {
        form = await readForm(request);
      } catch {
        return error("无法读取上传文件，请重新选择图片", 400);
      }
      if (!form) return error("图片为空或超过 2 MB", 413);
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0 || [...form.keys()].length !== 1) {
        return error("请选择一张图片", 400);
      }
      if (file.size > AVATAR_MAX_BYTES) return error("图片不能超过 2 MB", 413);
      if (!AVATAR_MIME_TYPES.includes(file.type) || !await hasImageSignature(file)) {
        return error("仅支持有效的 PNG、JPEG 或 WebP 图片", 400);
      }

      const extension = file.type === "image/jpeg" ? "jpg" : file.type.slice(6);
      const path = `${encodeURIComponent(session.user.id)}/${randomUUID()}.${extension}`;
      const url = await upload(file, path);
      return Response.json({ url }, { headers: { "Cache-Control": "no-store" } });
    } catch (cause) {
      // Do not log storage errors: they may contain connection or credential details.
      console.error("Avatar upload failed", { kind: cause instanceof Error ? cause.name : "UnknownError" });
      return error("头像上传失败，请稍后重试；若持续失败，请联系管理员检查存储配置", 503);
    }
  };
}
