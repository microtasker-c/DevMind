import { z } from "zod";
import { ArticleError } from "./errors";
import { documentPlainText, isSafeUrl, parseArticleDocument } from "./document-schema";

const inputSchema = z.object({
  id: z.uuid().optional(), revision: z.number().int().positive().optional(),
  title: z.string().trim().max(200, "标题最多 200 字。"),
  excerpt: z.string().trim().max(500, "摘要最多 500 字。"),
  coverUrl: z.string().trim().max(2048, "封面链接过长。").refine((value) => !value || isSafeUrl(value), "封面需要有效的 HTTP(S) 链接，且不能包含账户密码。"),
  tags: z.array(z.string().trim().min(1, "标签不能为空。").max(32, "标签最多 32 字。")).max(5, "最多添加 5 个标签。"),
  status: z.enum(["draft", "published"]), document: z.unknown(),
}).strict().refine((input) => !input.id || input.revision !== undefined, "编辑文章时需要版本信息。");

export function parseSaveArticle(input: unknown) {
  const result = inputSchema.safeParse(input);
  if (!result.success) throw new ArticleError("INVALID", result.error.issues[0]?.message ?? "文章数据无效。");
  const value = result.data;
  const document = parseArticleDocument(value.document);
  const text = documentPlainText(document);
  if (value.status === "published" && !value.title) throw new ArticleError("INVALID", "发布前请填写文章标题。");
  if (value.status === "published" && !text) throw new ArticleError("INVALID", "发布前请填写文章正文。");
  const tags = new Map<string, { name: string; slug: string }>();
  for (const name of value.tags) {
    const slug = name.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}+#.]+/gu, "-").replace(/^-|-$/g, "");
    if (!/[\p{L}\p{N}]/u.test(slug)) throw new ArticleError("INVALID", "标签至少需要包含一个汉字、字母或数字。");
    if (slug.length > 64) throw new ArticleError("INVALID", "标签规范化后过长，请使用更短的名称。");
    if (!tags.has(slug)) tags.set(slug, { name, slug });
  }
  return {
    ...value, document, coverUrl: value.coverUrl || null, tags: [...tags.values()],
    excerpt: value.excerpt || text.replace(/\s+/g, " ").slice(0, 200),
    readingMinutes: Math.max(1, Math.ceil((text.match(/[\p{Script=Han}]/gu)?.length ?? 0) / 400 + (text.replace(/[\p{Script=Han}]/gu, " ").match(/[\p{L}\p{N}]+/gu)?.length ?? 0) / 200)),
  };
}

const cursorSchema = z.object({ id: z.uuid(), publishedAt: z.iso.datetime() }).strict();
export function parseCursor(input: string) {
  try {
    if (input.length > 512 || !/^[\w-]+$/.test(input)) throw new Error("invalid");
    return cursorSchema.parse(JSON.parse(Buffer.from(input, "base64url").toString("utf8")));
  } catch {
    throw new ArticleError("INVALID", "分页位置无效，请返回首页重新加载。");
  }
}
export function encodeCursor(value: z.infer<typeof cursorSchema>): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function isArticleId(value: string): boolean {
  return z.uuid().safeParse(value).success;
}
