import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

export function createDatabase(connectionString: string) {
  const client = neon(connectionString);
  return drizzle(client, { schema });
}

export type MangaFluxDatabase = ReturnType<typeof createDatabase>;

export async function probeDatabase(
  db: MangaFluxDatabase,
  timeoutMs = 4_000
) {
  const startedAt = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      db.execute(sql`select 1 as ok`),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Database health check timed out")),
          timeoutMs
        );
      })
    ]);

    return {
      status: "operational" as const,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString()
    };
  } catch {
    return {
      status: "unavailable" as const,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString()
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
