"use client";
import { Button, toast } from "@heroui/react";
import { useState } from "react";
import { Icon } from "../home/icons";
import { toggleBookmarkAction } from "@/app/actions/articles";
export function BookmarkButton({ articleId }: { articleId: string }) { const [bookmarked, setBookmarked] = useState(false); return <Button isIconOnly variant="ghost" aria-label="收藏文章" className={bookmarked ? "text-warning" : "text-muted"} onPress={async () => { const result = await toggleBookmarkAction(articleId); if (!result.ok) toast.danger(result.message); else { setBookmarked(Boolean(result.bookmarked)); toast.success(result.bookmarked ? "收藏成功" : "已取消收藏"); } }}><Icon name="bookmark" size={20} /></Button>; }
