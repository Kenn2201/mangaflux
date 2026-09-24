import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function read(relative) {
  return readFile(path.join(root, relative), "utf8");
}

const packageFiles = [
  "package.json",
  "apps/web/package.json",
  "apps/api/package.json",
  "packages/db/package.json",
  "packages/runtime/package.json",
  "packages/sources/package.json"
];

const packages = await Promise.all(
  packageFiles.map(async (file) => ({
    file,
    json: JSON.parse(await read(file))
  }))
);

const rootVersion = packages[0].json.version;

for (const { file, json } of packages) {
  if (json.version !== rootVersion) {
    throw new Error(
      `Version mismatch: ${file} has ${json.version}, expected ${rootVersion}`
    );
  }
}

const server = await read("apps/api/src/server.ts");
const source = await read("packages/sources/src/mangadex.ts");

if (!server.includes(`const APP_VERSION = "${rootVersion}";`)) {
  throw new Error("apps/api APP_VERSION is not synchronized.");
}

if (!source.includes(`MangaFlux/${rootVersion} (+https://manga.kenncode.me)`)) {
  throw new Error("MangaDex user-agent version is not synchronized.");
}

const render = await read("render.yaml");

if (
  /key:\s*ADMIN_EMAILS[\s\S]{0,120}\bvalue\s*:/m.test(render)
) {
  throw new Error(
    "ADMIN_EMAILS must not be hardcoded in render.yaml."
  );
}

const publicSecretNames = [
  "NEXT_PUBLIC_DATABASE_URL",
  "NEXT_PUBLIC_AUTH_PROXY_SECRET",
  "NEXT_PUBLIC_MANGAFLUX_AUTH_PROXY_SECRET",
  "NEXT_PUBLIC_RESEND_API_KEY",
  "NEXT_PUBLIC_ADMIN_EMAILS"
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const output = [];

  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git"
    ) {
      continue;
    }

    const full = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      output.push(...(await walk(full)));
    } else if (entry.isFile()) {
      output.push(full);
    }
  }

  return output;
}

for (const file of await walk(root)) {
  if (
    path.relative(root, file).replace(/\\/g, "/") ===
    "scripts/check-release.mjs"
  ) {
    continue;
  }

  if (!/\.(?:ts|tsx|js|mjs|json|ya?ml|md)$/.test(file)) continue;

  let content;
  try {
    content = await readFile(file, "utf8");
  } catch {
    continue;
  }

  for (const name of publicSecretNames) {
    if (content.includes(name)) {
      throw new Error(
        `Forbidden public secret variable name ${name} found in ${path.relative(
          root,
          file
        )}`
      );
    }
  }
}

const privateApiSegments = [
  "/api/auth/",
  "/api/account/",
  "/api/state/",
  "/api/community/",
  "/api/admin/"
];

for (const file of await walk(
  path.join(root, "apps", "web", "app", "api")
)) {
  if (!file.endsWith("route.ts")) continue;

  const relative = file
    .replace(/\\/g, "/")
    .split("/apps/web/app")[1] ?? "";
  const content = await readFile(file, "utf8");

  if (
    privateApiSegments.some((segment) => relative.includes(segment)) &&
    content.includes("publicProxyHeaders")
  ) {
    throw new Error(
      `Private API route must not use public cache headers: ${relative}`
    );
  }
}

const nextConfig = await read("apps/web/next.config.mjs");

for (const required of [
  "poweredByHeader: false",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy"
]) {
  if (!nextConfig.includes(required)) {
    throw new Error(
      `Frontend security-header invariant missing: ${required}`
    );
  }
}

console.log(
  `Release invariants passed for MangaFlux v${rootVersion}.`
);
