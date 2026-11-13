"use client";

import { BlockNoteViewRaw, useCreateBlockNote } from "@blocknote/react";
import { zh } from "@blocknote/core/locales";
import { useEffect } from "react";
import type { ArticleDocument } from "@/lib/articles/types";
import { articleEditorSchema, toEditorDocument } from "./editor-schema";
import { EditorToolbar } from "./editor-toolbar";
import { articleLink } from "./article-link";
import "@blocknote/core/style.css";
import "./editor.css";
import "./reader.css";

type Props = {
  document: ArticleDocument;
  onChange?: (document: ArticleDocument) => void;
  onReady?: (document: ArticleDocument) => void;
  readOnly?: boolean;
  disabled?: boolean;
};

export default function BlockEditor({ document, onChange, onReady, readOnly = false, disabled = false }: Props) {
  const editor = useCreateBlockNote({
    schema: articleEditorSchema,
    _tiptapOptions: { extensions: [articleLink] },
    dictionary: { ...zh, placeholders: { ...zh.placeholders, default: "从一个想法开始…" } },
    initialContent: document.length ? toEditorDocument(document) : undefined,
    trailingBlock: !readOnly,
  });
  useEffect(() => { onReady?.(editor.document); }, [editor, onReady]);
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
