import { Auth } from "@better-auth-ui/heroui";

type AuthPageProps = {
  params: Promise<{ path?: string[] }>;
};

export default async function AuthPage({ params }: AuthPageProps) {
  const { path } = await params;
  return (
    <main className="flex min-h-[100svh] w-full items-center justify-center bg-background px-6 py-12">
      <Auth path={path?.join("/") || "sign-in"} className="w-full max-w-md" />
    </main>
  );
}
