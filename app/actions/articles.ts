"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { saveArticle, deleteArticle, toggleBookmark, ArticleError } from "@/lib/articles/service";

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

export async function deleteArticleAction(id: string) {
  try { const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } }); if (!session) return { ok: false, message: "请先登录" }; await deleteArticle(session.user.id, id); revalidatePath("/my/articles"); revalidatePath("/"); return { ok: true }; }
  catch (error) { return { ok: false, message: error instanceof ArticleError ? error.message : "删除失败，请稍后重试" }; }
}

export async function toggleBookmarkAction(articleId: string) {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
  if (!session) return { ok: false, message: "请先登录" };
  try { const bookmarked = await toggleBookmark(session.user.id, articleId); revalidatePath(`/articles/${articleId}`); revalidatePath("/bookmarks"); return { ok: true, bookmarked }; }
  catch (error) { console.error("Bookmark toggle failed", error instanceof Error ? error.message : error); return { ok: false, message: "收藏失败，请稍后重试" }; }
}
