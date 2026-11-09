import { CommunityShell } from "./components/home/community-shell";
import { Loading as LoadingIndicator } from "./components/ui/loading";

export default function Loading() {
  return <CommunityShell><LoadingIndicator /></CommunityShell>;
}
