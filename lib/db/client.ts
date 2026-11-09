import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

function createDatabase() {
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return drizzle(postgres(connectionString, {
    prepare: false,
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
  }), { schema });
}

let database: ReturnType<typeof createDatabase> | undefined;

export function getDb() {
  return database ??= createDatabase();
}
