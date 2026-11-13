export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function getAvatarStorageConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.SUPABASE_AVATAR_BUCKET || "avatars";
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  if (!/^[a-zA-Z0-9_-]+$/u.test(bucket)) throw new Error("Invalid avatar bucket name");
  return { url: new URL(url).origin, bucket };
}

export function getOwnedAvatarPath(image: string, userId: string): string | null {
  const { url, bucket } = getAvatarStorageConfig();
  const prefix = `${url}/storage/v1/object/public/${bucket}/${encodeURIComponent(userId)}/`;
  if (!image.startsWith(prefix)) return null;
  const filename = image.slice(prefix.length);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpg|webp)$/u.test(filename)) return null;
  return `${encodeURIComponent(userId)}/${filename}`;
}
