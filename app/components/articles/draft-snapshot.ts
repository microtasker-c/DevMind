import type { ArticleDocument } from "@/lib/articles/types";

export type DraftFields = {
  title: string;
  excerpt: string;
  coverUrl: string;
  tags: string;
  document: ArticleDocument;
};

// Block IDs are editor bookkeeping, not changes to the article's content.
function contentValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(contentValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value)
      .filter(([key, child]) => key !== "id" && child !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, contentValue(child)]));
  }
  return value;
}

export function draftSnapshot(fields: DraftFields): string {
  return JSON.stringify(contentValue({
    ...fields,
    tags: fields.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
  }));
}
