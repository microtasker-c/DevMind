"use client";

import { BlockNoteViewRaw, useCreateBlockNote } from "@blocknote/react";
import { zh } from "@blocknote/core/locales";
import type { ArticleDocument } from "@/lib/articles/types";
import { articleEditorSchema, toEditorDocument } from "./editor-schema";
import { EditorToolbar } from "./editor-toolbar";
import "@blocknote/core/style.css";
import "./editor.css";

type Props = {
  document: ArticleDocument;
  onChange?: (document: ArticleDocument) => void;
  readOnly?: boolean;
  disabled?: boolean;
};

export default function BlockEditor({ document, onChange, readOnly = false, disabled = false }: Props) {
  const editor = useCreateBlockNote({
    schema: articleEditorSchema,
    dictionary: { ...zh, placeholders: { ...zh.placeholders, default: "从一个想法开始…" } },
    initialContent: document.length ? toEditorDocument(document) : undefined,
    trailingBlock: !readOnly,
  });
  return (
    <div className={`article-blocknote ${readOnly ? "article-reader" : "article-writer"}`}>
      {!readOnly && <EditorToolbar editor={editor} disabled={disabled} />}
      <div className={readOnly ? undefined : "article-writing-content"}>
      <BlockNoteViewRaw
        editor={editor}
        theme="light"
        editable={!readOnly && !disabled}
        onChange={() => onChange?.(editor.document)}
        formattingToolbar={false} linkToolbar={false} slashMenu={false} sideMenu={false}
        filePanel={false} tableHandles={false} emojiPicker={false} comments={false}
      />
      </div>
    </div>
  );
}
