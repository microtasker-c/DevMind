type AccessSession = { user: { emailVerified: boolean } } | null;

export function safeReturnTo(value: unknown): string {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//")) return "/";
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return "/"; }
  if (/[\\\u0000-\u001f\u007f]/u.test(decoded) || decoded.startsWith("//")) return "/";
  const url = new URL(value, "https://dev-mind.invalid");
  const decodedPath = decodeURIComponent(url.pathname);
  if (url.origin !== "https://dev-mind.invalid" || /^\/(?:auth|api|verify-email)(?:\/|$)/u.test(decodedPath)) return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}

export function getAccessDecision(session: AccessSession, returnTo: string): string | null {
  const destination = encodeURIComponent(safeReturnTo(returnTo));
  if (!session) return `/auth/sign-in?redirectTo=${destination}`;
  return null;
}
