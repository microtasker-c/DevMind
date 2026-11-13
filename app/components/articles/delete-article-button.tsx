"use client";
import { AlertDialog, Button, toast } from "@heroui/react";
import { Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteArticleAction } from "@/app/actions/articles";
export function DeleteArticleButton({ id }: { id: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteArticleAction(id);
    setIsDeleting(false);
    if (!result.ok) { toast.danger(result.message); return; }
    setIsOpen(false);
    toast.success("文章已删除");
    router.refresh();
  }
  return <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen}>
    <AlertDialog.Trigger><Button isIconOnly variant="danger-soft" aria-label="删除文章"><Trash size={18} weight="regular" /></Button></AlertDialog.Trigger>
    <AlertDialog.Backdrop><AlertDialog.Container><AlertDialog.Dialog>
      <AlertDialog.Header><AlertDialog.Heading>删除文章</AlertDialog.Heading></AlertDialog.Header>
      <AlertDialog.Body>确定删除这篇文章吗？删除后无法恢复。</AlertDialog.Body>
      <AlertDialog.Footer>
        <Button variant="tertiary" isDisabled={isDeleting} onPress={() => setIsOpen(false)}>取消</Button>
        <Button variant="danger" isPending={isDeleting} onPress={handleDelete}>确认删除</Button>
      </AlertDialog.Footer>
    </AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
  </AlertDialog>;
}
