import { HomeShell } from "./components/home/home-shell";
import { listArticles } from "@/lib/articles/queries";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; cursor?: string }> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const cursor = typeof params.cursor === "string" ? params.cursor : undefined;
  const { items, nextCursor } = await listArticles({ query, cursor });
  return <HomeShell articles={items} query={query} nextCursor={nextCursor} />;
}
