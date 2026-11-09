"use client";

import { Button, Description, Input, Label, TextArea, TextField } from "@heroui/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveArticleAction } from "@/app/actions/articles";
import type { ArticleDetail, ArticleDocument } from "@/lib/articles/types";
import { useUnsavedChanges } from "./unsaved-changes";
import { Loading } from "../ui/loading";

const BlockEditor = dynamic(() => import("./block-editor"), {
  ssr: false,
  loading: () => <Loading label="正在加载编辑器" />,
});

export function ArticleEditor({ initial }: { initial?: ArticleDetail }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [document, setDocument] = useState<ArticleDocument>(initial?.document ?? [{ type: "paragraph", content: [] }]);
  const [saved, setSaved] = useState(initial ? { id: initial.id, revision: initial.revision } : undefined);
  const [published, setPublished] = useState(initial?.status === "published");
  const [showPublish, setShowPublish] = useState(published);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useUnsavedChanges(dirty);

  function change(set: (value: string) => void) {
    return (value: string) => { set(value); setDirty(true); setMessage(""); };
  }
  async function save(status: "draft" | "published") {
    setPending(true); setError(""); setMessage("");
    try {
      const result = await saveArticleAction({
        ...saved, title, excerpt, coverUrl, document,
        tags: tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean), status,
      });
      if (!result.ok) { setError(result.message); return; }
      setSaved({ id: result.id, revision: result.revision });
      setPublished(status === "published"); setDirty(false);
      setMessage(status === "published" ? "文章已发布，公开内容已更新。" : "草稿已保存，仅你可见。");
      if (!saved) router.replace(`/articles/${result.id}/edit`);
    } catch {
      setError("网络连接失败，请重试。请勿关闭页面，以免丢失未保存内容。");
    } finally { setPending(false); }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{published ? "编辑文章" : "写文章"}</h1>
          <p className="mt-1 text-sm text-muted">{published ? "保存后会立即更新公开内容。" : "先记录你的想法，准备好后再发布。"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!published && <Button variant="secondary" isDisabled={pending} onPress={() => save("draft")}>{pending ? "保存中…" : "保存草稿"}</Button>}
          <Button isDisabled={pending} onPress={() => published ? save("published") : setShowPublish(true)}>{pending ? "保存中…" : published ? "保存并更新" : "发布文章"}</Button>
        </div>
      </div>
      <fieldset disabled={pending} className="min-w-0 space-y-6">
        <section aria-label="文章写作区" className="rounded-xl border border-divider bg-surface shadow-sm">
          <TextField value={title} onChange={change(setTitle)} maxLength={200} className="mx-auto w-full max-w-4xl px-6 pt-10 pb-6 sm:px-12 sm:pt-14">
            <Label className="sr-only">文章标题</Label>
            <TextArea rows={1} style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: 1.35 }} className="h-auto min-h-16 w-full resize-none rounded-none border-0 bg-transparent px-0 py-2 font-semibold tracking-tight shadow-none field-sizing-content focus:outline-none focus:ring-0" placeholder="文章标题" />
          </TextField>
          <BlockEditor document={initial?.document ?? []} disabled={pending} onChange={(next) => { setDocument(next); setDirty(true); setMessage(""); }} />
        </section>
        <div className="mx-auto w-full max-w-4xl space-y-6 px-1 sm:px-12">
        <TextField value={tags} onChange={change(setTags)} className="w-full">
          <Label>技术标签</Label><Input placeholder="例如：React, TypeScript" />
          <Description>使用逗号分隔，最多 5 个标签。</Description>
        </TextField>
        {showPublish && (
          <section aria-label="发布设置" className="space-y-5 border-t border-divider pt-6">
            <h2 className="text-lg font-semibold">发布设置</h2>
            <TextField value={excerpt} onChange={change(setExcerpt)} maxLength={500} className="w-full">
              <Label>文章摘要（选填）</Label><TextArea rows={3} placeholder="简要介绍文章的核心内容" />
              <Description>留空时根据正文自动生成。</Description>
            </TextField>
            <TextField value={coverUrl} onChange={change(setCoverUrl)} type="url" className="w-full">
              <Label>封面链接（选填）</Label><Input placeholder="https://example.com/cover.jpg" />
              <Description>填写公开可访问的图片链接；留空时不展示封面。</Description>
            </TextField>
            {!published && <Button isDisabled={pending} onPress={() => save("published")}>确认发布</Button>}
          </section>
        )}
        </div>
      </fieldset>
      {error && <p role="alert" className="rounded-lg border border-danger/30 p-4 text-sm text-danger">{error}</p>}
      <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-4 text-sm text-muted">
        <span>{message || (dirty ? "有未保存的更改" : published ? "文章已公开" : "草稿仅自己可见")}</span>
        {published && saved && <Link className="text-foreground underline underline-offset-4" href={`/articles/${saved.id}`}>查看文章</Link>}
      </div>
    </div>
  );
}
