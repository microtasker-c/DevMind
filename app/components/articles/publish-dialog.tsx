"use client";

import { Button, Description, Input, Label, Modal, TextArea, TextField } from "@heroui/react";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tags: string;
  excerpt: string;
  coverUrl: string;
  onTagsChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onCoverUrlChange: (value: string) => void;
  pending: boolean;
  onPublish: () => void;
};

export function PublishDialog(props: Props) {
  return (
    <Modal.Backdrop isOpen={props.isOpen} onOpenChange={props.onOpenChange} isDismissable={!props.pending} isKeyboardDismissDisabled={props.pending}>
      <Modal.Container size="lg" scroll="inside">
        <Modal.Dialog>
          <form noValidate onSubmit={(event) => { event.preventDefault(); if (!props.pending) props.onPublish(); }}>
            <Modal.Header>
              <Modal.Heading>发布文章</Modal.Heading>
              <p className="mt-2 text-sm text-muted">完善文章信息。发布后文章将公开，且不可再编辑。</p>
            </Modal.Header>
            <Modal.Body className="space-y-6">
              <TextField value={props.tags} onChange={props.onTagsChange} isDisabled={props.pending} className="w-full">
                <Label>技术标签</Label><Input autoFocus placeholder="例如：React, TypeScript" />
                <Description>使用逗号分隔，最多 5 个标签。</Description>
              </TextField>
              <TextField value={props.excerpt} onChange={props.onExcerptChange} isDisabled={props.pending} maxLength={500} className="w-full">
                <Label>文章摘要（选填）</Label><TextArea rows={3} placeholder="简要介绍文章的核心内容" />
                <Description>留空时根据正文自动生成。</Description>
              </TextField>
              <TextField value={props.coverUrl} onChange={props.onCoverUrlChange} isDisabled={props.pending} type="url" className="w-full">
                <Label>封面链接（选填）</Label><Input placeholder="https://example.com/cover.jpg" />
                <Description>填写公开可访问的图片链接；留空时不展示封面。</Description>
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" isDisabled={props.pending} onPress={() => props.onOpenChange(false)}>继续编辑</Button>
              <Button type="submit" isDisabled={props.pending}>{props.pending ? "发布中…" : "确认发布"}</Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
