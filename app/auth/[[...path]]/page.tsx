import { Auth } from "@better-auth-ui/heroui";
import { notFound } from "next/navigation";

type AuthPageProps = {
  params: Promise<{ path?: string[] }>;
};

export default async function AuthPage({ params }: AuthPageProps) {
  const { path } = await params;
  const authPath = path?.join("/") || "sign-in";
  if (!["sign-in", "sign-up", "sign-out"].includes(authPath)) notFound();
  return (
    <main className="flex min-h-[100svh] w-full items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-md justify-center">
        <Auth path={authPath} />
      </div>
    </main>
  );
}
