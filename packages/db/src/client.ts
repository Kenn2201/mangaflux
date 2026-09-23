import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

export function createDatabase(connectionString: string) {
  const client = neon(connectionString);
  return drizzle(client, { schema });
}

export type MangaFluxDatabase = ReturnType<typeof createDatabase>;
