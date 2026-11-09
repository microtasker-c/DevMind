import { Auth } from "@better-auth-ui/heroui";
import { redirect } from "next/navigation";
import { safeReturnTo } from "@/lib/auth/access";

type AuthPageProps = {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{ redirectTo?: string }>;
};

export default async function AuthPage({ params, searchParams }: AuthPageProps) {
  const { path } = await params;
  if (path?.join("/") === "verify-email") {
    const { redirectTo } = await searchParams;
    redirect(`/verify-email?returnTo=${encodeURIComponent(safeReturnTo(redirectTo))}`);
  }
  return (
    <main className="flex min-h-[100svh] w-full items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-md justify-center">
        <Auth path={path?.join("/") || "sign-in"} />
      </div>
    </main>
  );
}
