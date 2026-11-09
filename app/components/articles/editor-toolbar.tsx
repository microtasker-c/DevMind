"use client";

import { Button, Input } from "@heroui/react";
import { useState } from "react";
import type { ArticleEditor } from "./editor-schema";

export function EditorToolbar({ editor, disabled }: { editor: ArticleEditor; disabled: boolean }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  function setBlock(type: "paragraph" | "heading" | "bulletListItem" | "numberedListItem" | "checkListItem" | "quote" | "codeBlock") {
    editor.focus();
    const blocks = editor.getSelection()?.blocks ?? [editor.getTextCursorPosition().block];
    blocks.forEach((block) => editor.updateBlock(block, type === "heading" ? { type, props: { level: 2 } } : { type }));
  }
  function addLink() {
    try {
      const url = new URL(link);
      if (!["https:", "http:", "mailto:"].includes(url.protocol)) throw new Error("invalid");
      editor.focus();
      editor.createLink(url.href, editor.getSelectedText() || url.href);
      setLink(""); setError("");
    } catch {
      setError("请填写有效的 http、https 或 mailto 链接。");
    }
  }
  return (
    <div className="sticky top-0 z-10 border-y border-divider bg-surface py-2">
      <div aria-label="正文格式" className="flex items-center gap-1 overflow-x-auto pb-1">
        {([
          ["paragraph", "正文"], ["heading", "标题"], ["bulletListItem", "无序列表"],
          ["numberedListItem", "有序列表"], ["checkListItem", "待办"], ["quote", "引用"], ["codeBlock", "代码"],
        ] as const).map(([type, label]) => (
          <Button key={type} className="shrink-0" size="sm" variant="ghost" isDisabled={disabled} onPress={() => setBlock(type)}>{label}</Button>
        ))}
        {([ ["bold", "粗体"], ["italic", "斜体"], ["code", "行内代码"] ] as const).map(([style, label]) => (
          <Button key={style} className="shrink-0" size="sm" variant="ghost" isDisabled={disabled} onPress={() => { editor.focus(); editor.toggleStyles({ [style]: true }); }}>{label}</Button>
        ))}
      </div>
      <div className="mt-1 flex max-w-md items-center gap-2">
        <Input aria-label="插入链接地址" className="h-8 min-w-0 text-xs" placeholder="选中文字后填写链接" value={link} disabled={disabled} onChange={(e) => setLink(e.target.value)} />
        <Button size="sm" variant="ghost" isDisabled={disabled || !link.trim()} onPress={addLink}>插入链接</Button>
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
