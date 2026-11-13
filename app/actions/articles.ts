"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { saveArticle, ArticleError } from "@/lib/articles/service";

export async function saveArticleAction(input: unknown): Promise<
  { ok: true; id: string; revision: number } | { ok: false; message: string }
> {
  try {
    const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
    const saved = await saveArticle(session, input);
    // Draft pages are dynamically rendered from the authenticated session.
    // A draft doesn't change public content. Revalidating here would also
    // re-render the editor before navigation and preload unused layout CSS.
    if (typeof input === "object" && input !== null && "status" in input && input.status === "published") {
      revalidatePath("/");
      revalidatePath("/my/articles");
      revalidatePath(`/articles/${saved.id}`);
      revalidatePath(`/articles/${saved.id}/edit`);
    }
    return { ok: true, ...saved };
  } catch (error) {
    if (error instanceof ArticleError) return { ok: false, message: error.message };
    console.error("Article save failed", error instanceof Error ? error.name : "UnknownError");
    return { ok: false, message: "保存失败，请稍后重试。当前编辑内容仍保留在页面中。" };
  }
}
