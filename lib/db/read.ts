function isConnectionTimeout(error: unknown): boolean {
  const seen = new Set<object>();
  while (error && typeof error === "object" && !seen.has(error)) {
    if ("code" in error && error.code === "CONNECT_TIMEOUT") return true;
    seen.add(error);
    error = "cause" in error ? error.cause : undefined;
  }
  return false;
}

/** Only use for reads outside transactions; writes must never be replayed here. */
export async function retryDatabaseRead<T>(read: () => Promise<T>): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (!isConnectionTimeout(error)) throw error;
    // Postgres.js destroys the timed-out socket. The next query reconnects.
    console.warn("Database connection timed out; retrying read once.");
    return read();
  }
}
