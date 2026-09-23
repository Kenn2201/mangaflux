import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "coverage",
  "playwright-report"
]);

const patterns = [
  ["Postgres URL with password", /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/gi],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g],
  ["OpenAI-style secret", /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/g],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/g],
  ["Private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ["Discord-style bot token", /\b[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{20,}\b/g]
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".env") && entry.name !== ".env.example") continue;

    const fullPath = path.join(directory, entry.name);
    const relative = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await walk(fullPath)));
      }
      continue;
    }

    if (!entry.isFile()) continue;

    const info = await stat(fullPath);
    if (info.size > 1_000_000) continue;

    files.push({ fullPath, relative });
  }

  return files;
}

const findings = [];

for (const file of await walk(root)) {
  let content;

  try {
    content = await readFile(file.fullPath, "utf8");
  } catch {
    continue;
  }

  for (const [name, pattern] of patterns) {
    pattern.lastIndex = 0;

    for (const match of content.matchAll(pattern)) {
      const value = match[0];

      if (
        /example|placeholder|your[_-]/i.test(value) ||
        file.relative === "scripts/check-secrets.mjs"
      ) {
        continue;
      }

      findings.push({
        file: file.relative,
        detector: name
      });
    }
  }
}

if (findings.length > 0) {
  console.error("Potential secrets detected:");
  for (const finding of findings) {
    console.error(`- ${finding.file}: ${finding.detector}`);
  }
  process.exit(1);
}

console.log("Secret scan passed: no matching credential patterns found.");
