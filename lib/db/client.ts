import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

export function getDb() {
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return drizzle(postgres(connectionString, { prepare: false }), { schema });
}
