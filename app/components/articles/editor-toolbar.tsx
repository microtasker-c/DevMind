"use client";

import { Button, Input } from "@heroui/react";
import { Bold, Code, Italic, Link as LinkIcon } from "@gravity-ui/icons";
import { useEditorChange, useEditorSelectionChange } from "@blocknote/react";
import { useState } from "react";
import type { ArticleEditor } from "./editor-schema";

export function EditorToolbar({ editor, disabled }: { editor: ArticleEditor; disabled: boolean }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [styles, setStyles] = useState(() => editor.getActiveStyles());
  const [block, setCurrentBlock] = useState(() => editor.getTextCursorPosition().block);
  function syncSelection() {
    setStyles(editor.getActiveStyles());
    setCurrentBlock(editor.getTextCursorPosition().block);
  }
  useEditorChange(syncSelection, editor);
  useEditorSelectionChange(syncSelection, editor);

  function setBlock(type: "paragraph" | "heading" | "bulletListItem" | "numberedListItem" | "checkListItem" | "quote" | "codeBlock", level: 1 | 2 | 3 = 2) {
    editor.focus();
    const blocks = editor.getSelection()?.blocks ?? [editor.getTextCursorPosition().block];
    blocks.forEach((block) => editor.updateBlock(block, type === "heading" ? { type, props: { level } } : { type }));
  }
  function addLink() {
    let url: URL;
    try {
      url = new URL(link.trim());
      if (!["https:", "http:", "mailto:"].includes(url.protocol)) throw new Error("invalid");
    } catch {
      setError("请填写有效的 http、https 或 mailto 链接。");
      return;
    }
    editor.focus();
    editor.createLink(url.href, editor.getSelectedText() || url.href);
    setLink(""); setError(""); setShowLink(false);
  }
  return (
    <div className="sticky top-20 z-10 border-y border-divider bg-surface/95 px-3 py-2 backdrop-blur-md sm:px-6">
      <div aria-label="正文格式" className="mx-auto flex max-w-4xl flex-wrap items-center gap-1" onMouseDown={(event) => {
        if (event.target instanceof Element && event.target.closest("button")) event.preventDefault();
      }}>
        <Button size="sm" variant={block.type === "paragraph" ? "secondary" : "ghost"} aria-pressed={block.type === "paragraph"} isDisabled={disabled} onPress={() => setBlock("paragraph")}>正文</Button>
        {([1, 2, 3] as const).map((level) => (
          <Button key={level} size="sm" isIconOnly aria-label={`${level} 级标题`} aria-pressed={block.type === "heading" && block.props.level === level} variant={block.type === "heading" && block.props.level === level ? "secondary" : "ghost"} isDisabled={disabled} onPress={() => setBlock("heading", level)}>
            <span className="font-semibold">H{level}</span>
          </Button>
        ))}
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-divider" />
        {([ ["bold", "粗体", Bold], ["italic", "斜体", Italic], ["code", "行内代码", Code] ] as const).map(([style, label, Icon]) => (
          <Button key={style} size="sm" isIconOnly aria-label={label} aria-pressed={Boolean(styles[style])} variant={styles[style] ? "secondary" : "ghost"} isDisabled={disabled} onPress={() => { editor.focus(); editor.toggleStyles({ [style]: true }); }}><Icon width={16} height={16} /></Button>
        ))}
        <Button size="sm" isIconOnly aria-label="插入链接" aria-expanded={showLink} variant={showLink ? "secondary" : "ghost"} isDisabled={disabled} onPress={() => { setShowLink(!showLink); setError(""); }}><LinkIcon width={16} height={16} /></Button>
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-divider" />
        {([
          ["bulletListItem", "无序列表"], ["numberedListItem", "有序列表"],
          ["checkListItem", "待办"], ["quote", "引用"], ["codeBlock", "代码块"],
        ] as const).map(([type, label]) => (
          <Button key={type} size="sm" aria-pressed={block.type === type} variant={block.type === type ? "secondary" : "ghost"} isDisabled={disabled} onPress={() => setBlock(type)}>{label}</Button>
        ))}
      </div>
      {showLink && <div className="mx-auto mt-2 flex max-w-4xl flex-wrap items-center gap-2 border-t border-divider pt-2">
        <Input aria-label="插入链接地址" className="h-9 min-w-0 flex-1 text-sm" placeholder="https://example.com" value={link} disabled={disabled} onChange={(e) => { setLink(e.target.value); setError(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLink(); } }} />
        <Button size="sm" variant="secondary" isDisabled={disabled || !link.trim()} onPress={addLink}>插入链接</Button>
        <Button size="sm" variant="ghost" onPress={() => { setShowLink(false); setError(""); }}>取消</Button>
        {error && <p role="alert" className="w-full text-xs text-danger">{error}</p>}
      </div>
      }
    </div>
  );
}
