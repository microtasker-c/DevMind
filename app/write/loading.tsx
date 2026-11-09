import { ArticleLayout } from "@/app/components/articles/article-layout";
import { Loading } from "@/app/components/ui/loading";

export default function WriteLoading() {
  return <ArticleLayout writingMode><Loading label="正在加载编辑器" /></ArticleLayout>;
}
