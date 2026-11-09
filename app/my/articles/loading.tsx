import { CommunityShell } from "@/app/components/home/community-shell";
import { Loading } from "@/app/components/ui/loading";

export default function MyArticlesLoading() {
  return <CommunityShell activeItem="我的文章"><Loading /></CommunityShell>;
}
