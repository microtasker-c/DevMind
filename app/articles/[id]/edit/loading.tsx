import { ArticleLayout } from "@/app/components/articles/article-layout";
import { Loading } from "@/app/components/ui/loading";

export default function EditLoading() {
  return <ArticleLayout writingMode><Loading label="正在加载文章" /></ArticleLayout>;
}
