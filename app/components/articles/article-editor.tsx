"use client";

import { Button, Label, TextArea, TextField, toast } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { saveArticleAction } from "@/app/actions/articles";
import type { ArticleDetail, ArticleDocument } from "@/lib/articles/types";
import { useUnsavedChanges } from "./unsaved-changes";
import { Loading } from "../ui/loading";
import { PublishDialog } from "./publish-dialog";
import { draftSnapshot, type DraftFields } from "./draft-snapshot";
import { useNavigationToast } from "../ui/navigation-toast";

const BlockEditor = dynamic(() => import("./block-editor"), {
  ssr: false,
  loading: () => <Loading label="正在加载编辑器" />,
});

export function ArticleEditor({ initial }: { initial?: ArticleDetail }) {
  const router = useRouter();
  const notifyOnArrival = useNavigationToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [document, setDocument] = useState<ArticleDocument>(initial?.document ?? [{ type: "paragraph", content: [] }]);
  const [saved, setSaved] = useState(initial ? { id: initial.id, revision: initial.revision } : undefined);

  const [showPublish, setShowPublish] = useState(false);
  const [baseline, setBaseline] = useState<DraftFields>(() => ({
    title: initial?.title ?? "", excerpt: initial?.excerpt ?? "", coverUrl: initial?.coverUrl ?? "",
    tags: initial?.tags.join(", ") ?? "", document: initial?.document ?? [{ type: "paragraph", content: [] }],
  }));
  const [editorReady, setEditorReady] = useState(false);
  const [pending, setPending] = useState(false);
  const fields = { title, excerpt, coverUrl, tags, document };
  const dirty = draftSnapshot(fields) !== draftSnapshot(baseline);
  useUnsavedChanges(dirty);
  const onEditorReady = useCallback((next: ArticleDocument) => {
    setDocument(next);
    setBaseline((previous) => ({ ...previous, document: next }));
    setEditorReady(true);
  }, []);

  function change(set: (value: string) => void) {
    return (value: string) => set(value);
  }
  async function save(status: "draft" | "published") {
    if (pending || !editorReady) return;
    if (status === "draft" && !dirty) {
      toast.info("没有需要保存的更改", { timeout: 4000 });
      return;
    }
    setPending(true);
    try {
      const result = await saveArticleAction({
        ...saved, title, excerpt, coverUrl, document,
        tags: tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean), status,
      });
      if (!result.ok) {
        toast.danger(status === "published" ? "文章发布失败" : "草稿保存失败", { description: result.message, timeout: 6000 });
        return;
      }
      setSaved({ id: result.id, revision: result.revision });
      setBaseline(fields);
      if (status === "published") {
        setShowPublish(false);
        router.replace(`/articles/${result.id}`);
        toast.success("文章发布成功", { timeout: 4000 });
        return;
      }
      notifyOnArrival({ pathname: "/", message: "草稿已保存，仅你可见。" });
      router.replace("/");
    } catch {
      toast.danger(status === "published" ? "文章发布失败" : "草稿保存失败", {
        description: "网络连接失败，请重试。当前输入仍保留在页面中。", timeout: 6000,
      });
    } finally { setPending(false); }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">写文章</h1>
          <p className="mt-1 text-sm text-muted">先记录你的想法，准备好后再发布。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" isDisabled={pending || !editorReady} onPress={() => save("draft")}>{pending ? "保存中…" : "保存草稿"}</Button>
          <Button isDisabled={pending || !editorReady} onPress={() => setShowPublish(true)}>发布文章</Button>
        </div>
      </div>
      <fieldset disabled={pending} className="min-w-0 space-y-6">
        <section aria-label="文章写作区" className="rounded-xl border border-divider bg-surface shadow-sm">
          <TextField value={title} onChange={change(setTitle)} maxLength={200} className="mx-auto w-full max-w-4xl px-6 pt-10 pb-6 sm:px-12 sm:pt-14">
            <Label className="sr-only">文章标题</Label>
            <TextArea rows={1} style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: 1.35 }} className="h-auto min-h-16 w-full resize-none rounded-none border-0 bg-transparent px-0 py-2 font-semibold tracking-tight shadow-none field-sizing-content focus:outline-none focus:ring-0" placeholder="文章标题" />
          </TextField>
          <BlockEditor document={initial?.document ?? []} disabled={pending} onReady={onEditorReady} onChange={setDocument} />
        </section>
      </fieldset>
      <PublishDialog isOpen={showPublish} onOpenChange={(open) => { if (!pending) setShowPublish(open); }}
        tags={tags} excerpt={excerpt} coverUrl={coverUrl}
        onTagsChange={change(setTags)} onExcerptChange={change(setExcerpt)} onCoverUrlChange={change(setCoverUrl)}
        pending={pending} onPublish={() => save("published")} />
      <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-4 text-sm text-muted">
        <span>{dirty ? "有未保存的更改" : "草稿仅自己可见"}</span>
      </div>
    </div>
  );
}
