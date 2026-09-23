import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { createDatabase } from "./client.js";

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.warn(
    "DATABASE_URL is not configured; skipping MangaFlux database migrations."
  );
  process.exit(0);
}

const migrationsFolder = fileURLToPath(
  new URL("../drizzle", import.meta.url)
);

const db = createDatabase(connectionString);

await migrate(db, { migrationsFolder });
console.log("MangaFlux database migrations are up to date.");
