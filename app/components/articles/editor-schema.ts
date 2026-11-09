import { BlockNoteSchema, defaultBlockSpecs, type PartialBlock } from "@blocknote/core";
import { createHeadingBlockSpec } from "@blocknote/core/blocks";

export const articleEditorSchema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: createHeadingBlockSpec({ levels: [1, 2, 3], allowToggleHeadings: false }),
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    checkListItem: defaultBlockSpecs.checkListItem,
    quote: defaultBlockSpecs.quote,
    codeBlock: defaultBlockSpecs.codeBlock,
    divider: defaultBlockSpecs.divider,
  },
});

export type ArticleEditor = typeof articleEditorSchema.BlockNoteEditor;
type EditorBlock = typeof articleEditorSchema.PartialBlock;

// Narrow validated persisted documents to the same block schema used by the UI.
export function toEditorDocument(document: PartialBlock[]): EditorBlock[] {
  return document.map((block): EditorBlock => {
    const children = block.children ? toEditorDocument(block.children) : undefined;
    switch (block.type) {
      case "paragraph": case "heading": case "bulletListItem": case "numberedListItem":
      case "checkListItem": case "quote": case "codeBlock": case "divider":
        return { ...block, children };
      default:
        throw new Error("文章包含当前编辑器不支持的内容，请联系管理员。");
    }
  });
}
