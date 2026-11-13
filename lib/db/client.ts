import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return drizzle(postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 30,
    max_lifetime: 60 * 5,
  }), { schema });
}

// Next.js reloads server modules during development; keep the pool across reloads.
const globalDatabase = globalThis as typeof globalThis & {
  devMindDatabase?: ReturnType<typeof createDatabase>;
};
let database: ReturnType<typeof createDatabase> | undefined;

export function getDb() {
  if (process.env.NODE_ENV === "production") return database ??= createDatabase();
  return globalDatabase.devMindDatabase ??= createDatabase();
}
