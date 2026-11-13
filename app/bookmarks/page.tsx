import Link from "next/link";
import { requireSession } from "@/lib/auth/guard";
import { listBookmarkedArticles } from "@/lib/articles/queries";
import { ArticleLayout } from "@/app/components/articles/article-layout";
import { BookmarksFeed } from "@/app/components/home/bookmarks-feed";

export const metadata = { title: "收藏 · Dev-Mind" };
export default async function BookmarksPage() {
  const session = await requireSession("/bookmarks");
  const articles = await listBookmarkedArticles(session.user.id);
  return <ArticleLayout activeItem="收藏"><BookmarksFeed articles={articles} />{!articles.length && <div className="mt-4 text-center"><Link href="/" className="underline">去首页发现文章</Link></div>}</ArticleLayout>;
}
