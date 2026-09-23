import { access, readFile } from "node:fs/promises";
import path from "node:path";

const folder = path.join(
  process.cwd(),
  "packages",
  "db",
  "drizzle"
);
const journalPath = path.join(folder, "meta", "_journal.json");
const journal = JSON.parse(await readFile(journalPath, "utf8"));

if (
  journal.version !== "7" ||
  journal.dialect !== "postgresql" ||
  !Array.isArray(journal.entries)
) {
  throw new Error("Invalid Drizzle migration journal.");
}

const seenIndexes = new Set();
const seenTags = new Set();

for (const [position, entry] of journal.entries.entries()) {
  if (
    entry.idx !== position ||
    seenIndexes.has(entry.idx) ||
    seenTags.has(entry.tag)
  ) {
    throw new Error("Drizzle migration journal ordering is invalid.");
  }

  seenIndexes.add(entry.idx);
  seenTags.add(entry.tag);

  const sqlPath = path.join(folder, `${entry.tag}.sql`);
  await access(sqlPath);

  const sql = await readFile(sqlPath, "utf8");
  if (!sql.trim()) {
    throw new Error(`Migration ${entry.tag} is empty.`);
  }
}

console.log(
  `Migration check passed: ${journal.entries.length} migration(s) tracked.`
);
