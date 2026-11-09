import { z } from "zod";
import type { PartialBlock } from "@blocknote/core";
import { ArticleError } from "./errors";

export const allowedBlockTypes = ["paragraph", "heading", "bulletListItem", "numberedListItem", "checkListItem", "quote", "codeBlock", "divider"] as const;
const colors = z.enum(["default", "gray", "brown", "red", "orange", "yellow", "green", "blue", "purple", "pink"]);
const commonProps = { backgroundColor: colors.optional(), textColor: colors.optional() };
const textProps = { ...commonProps, textAlignment: z.enum(["left", "center", "right", "justify"]).optional() };
const styles = z.object({
  bold: z.boolean().optional(), italic: z.boolean().optional(), underline: z.boolean().optional(),
  strike: z.boolean().optional(), code: z.boolean().optional(), textColor: colors.optional(), backgroundColor: colors.optional(),
}).strict();
const styledText = z.object({ type: z.literal("text"), text: z.string().max(200_000), styles: styles.default({}) }).strict();

export function isSafeUrl(value: string, allowMail = false): boolean {
  if (value.length > 2048 || /[\u0000-\u001f\u007f]/.test(value)) return false;
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:" || (allowMail && url.protocol === "mailto:"))
      && !url.username && !url.password;
  } catch {
    return false;
  }
}

const inlineContent = z.union([z.string().max(200_000), z.array(z.union([
  styledText,
  z.object({
    type: z.literal("link"), href: z.string().refine((value) => isSafeUrl(value, true)),
    content: z.union([z.string().max(200_000), z.array(styledText)]),
  }).strict(),
])).max(10_000)]);

const blockSchema: z.ZodType<PartialBlock> = z.lazy(() => {
  const base = { id: z.string().min(1).max(128).optional(), content: inlineContent.optional(), children: z.array(blockSchema).optional() };
  return z.discriminatedUnion("type", [
    z.object({ ...base, type: z.literal("paragraph"), props: z.object(textProps).strict().optional() }).strict(),
    z.object({ ...base, type: z.literal("heading"), props: z.object({ ...textProps, level: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(), isToggleable: z.literal(false).optional() }).strict().optional() }).strict(),
    z.object({ ...base, type: z.literal("bulletListItem"), props: z.object(textProps).strict().optional() }).strict(),
    z.object({ ...base, type: z.literal("numberedListItem"), props: z.object({ ...textProps, start: z.number().int().min(0).max(100_000).optional() }).strict().optional() }).strict(),
    z.object({ ...base, type: z.literal("checkListItem"), props: z.object({ ...textProps, checked: z.boolean().optional() }).strict().optional() }).strict(),
    z.object({ ...base, type: z.literal("quote"), props: z.object(commonProps).strict().optional() }).strict(),
    z.object({ ...base, type: z.literal("codeBlock"), props: z.object({ language: z.string().max(40).regex(/^[\w+#.-]*$/).optional() }).strict().optional() }).strict(),
    z.object({ id: base.id, type: z.literal("divider"), props: z.object({}).strict().optional(), children: base.children }).strict(),
  ]);
});

function checkDocumentLimits(input: unknown) {
  const seen = new WeakSet<object>();
  let nodes = 0;
  function visit(value: unknown, depth: number) {
    if (++nodes > 30_000 || depth > 30) throw new ArticleError("INVALID", "正文结构过于复杂，请减少嵌套或内容。");
    if (typeof value !== "object" || value === null) return;
    if (seen.has(value)) throw new ArticleError("INVALID", "正文包含循环结构。");
    seen.add(value);
    for (const child of Object.values(value)) visit(child, depth + 1);
    seen.delete(value);
  }
  visit(input, 0);
  const serialized = JSON.stringify(input);
  if (!serialized || new TextEncoder().encode(serialized).length > 512_000) throw new ArticleError("INVALID", "正文不能超过 500 KB。");
  let blocks = 0;
  const ids = new Set<string>();
  function count(value: unknown, depth: number) {
    if (!Array.isArray(value)) return;
    for (const block of value) {
      if (++blocks > 1000 || depth > 10) throw new ArticleError("INVALID", "正文最多 1000 个区块，嵌套不超过 10 层。");
      if (typeof block === "object" && block !== null && "id" in block && typeof block.id === "string") {
        if (ids.has(block.id)) throw new ArticleError("INVALID", "正文区块标识重复，请重新载入编辑器。");
        ids.add(block.id);
      }
      if (typeof block === "object" && block !== null && "children" in block) count(block.children, depth + 1);
    }
  }
  count(input, 1);
}

export function parseArticleDocument(input: unknown): PartialBlock[] {
  checkDocumentLimits(input);
  const result = z.array(blockSchema).min(1).max(1000).safeParse(input);
  if (!result.success) throw new ArticleError("INVALID", "正文格式无效，或包含暂不支持的区块、样式和链接。");
  return result.data;
}

export function documentPlainText(document: PartialBlock[]): string {
  const text: string[] = [];
  function visit(blocks: PartialBlock[]) {
    for (const block of blocks) {
      if (typeof block.content === "string") text.push(block.content);
      else if (Array.isArray(block.content)) {
        text.push(block.content.map((inline) => {
          if (typeof inline === "string") return inline;
          if (inline.type === "text") return inline.text;
          if (inline.type === "link") return typeof inline.content === "string" ? inline.content : (inline.content ?? []).map((part) => typeof part === "string" ? part : part.text).join("");
          return "";
        }).join(""));
      }
      if (block.children) visit(block.children);
    }
  }
  visit(document);
  return text.join("\n").trim();
}
