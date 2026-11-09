"use client";

import dynamic from "next/dynamic";
import type { ArticleDocument } from "@/lib/articles/types";
import { Loading } from "../ui/loading";

const BlockEditor = dynamic(() => import("./block-editor"), {
  ssr: false,
  loading: () => <Loading label="正在加载正文" />,
});

export function ArticleBody({ document }: { document: ArticleDocument }) {
  return <BlockEditor document={document} readOnly />;
}
