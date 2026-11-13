import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getAvatarStorageConfig } from "./config";

export async function uploadAvatar(file: File, path: string) {
  const { url, bucket } = getAvatarStorageConfig();
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Supabase Storage server key is not configured");

  // Better Auth owns sessions; never use a browser's Supabase Auth credentials.
  const storage = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(30_000) }) },
  }).storage.from(bucket);
  const { error } = await storage.upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error("Supabase avatar upload failed", { cause: error });
  return storage.getPublicUrl(path).data.publicUrl;
}
