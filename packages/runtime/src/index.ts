import { isIP } from "node:net";

export type FetchSourceOptions = {
  allowedHosts: string[];
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  init?: RequestInit;
};

type BinarySourceResponse = {
  status: number;
  ok: boolean;
  finalUrl: string;
  headers: Record<string, string>;
  bytes: Uint8Array;
};

function normalizeHost(hostname: string) {
  return hostname.replace(/^\[/, "").replace(/\]$/, "").toLowerCase();
}

function isUnsafeLiteralHost(hostname: string) {
  const host = normalizeHost(hostname);
  const version = isIP(host);

  if (version === 4) {
    const parts = host.split(".").map(Number);
    const [a, b] = parts;

    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }

  if (version === 6) {
    return (
      host === "::1" ||
      host === "::" ||
      host.startsWith("fc") ||
      host.startsWith("fd") ||
      host.startsWith("fe8") ||
      host.startsWith("fe9") ||
      host.startsWith("fea") ||
      host.startsWith("feb")
    );
  }

  return host === "localhost" || host.endsWith(".localhost");
}

function assertAllowedUrl(input: string | URL, allowedHosts: string[]) {
  const parsed = input instanceof URL ? input : new URL(input);
  const allowed = new Set(allowedHosts.map(normalizeHost));
  const host = normalizeHost(parsed.hostname);

  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS sources are allowed");
  }

  if (parsed.username || parsed.password) {
    throw new Error("Credentials in source URLs are not allowed");
  }

  if (isUnsafeLiteralHost(host)) {
    throw new Error("Private or local source hosts are not allowed");
  }

  if (!allowed.has(host)) {
    throw new Error(`Host not allowed: ${host}`);
  }

  return parsed;
}

async function readLimitedBody(response: Response, maxBytes: number) {
  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (declaredLength > maxBytes) {
    throw new Error("Response exceeds configured size limit");
  }

  if (!response.body) return new Uint8Array();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error("Response exceeds configured size limit");
    }

    chunks.push(value);
  }

  const combined = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return combined;
}

export async function fetchBinarySource(
  url: string,
  options: FetchSourceOptions
): Promise<BinarySourceResponse> {
  const maxBytes = options.maxBytes ?? 5_000_000;
  const maxRedirects = options.maxRedirects ?? 3;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 12_000
  );

  let current = assertAllowedUrl(url, options.allowedHosts);

  try {
    for (let redirects = 0; redirects <= maxRedirects; redirects += 1) {
      const response = await fetch(current, {
        ...options.init,
        redirect: "manual",
        signal: controller.signal
      });

      if (
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.has("location")
      ) {
        if (redirects >= maxRedirects) {
          throw new Error("Too many redirects");
        }

        const next = new URL(
          response.headers.get("location")!,
          current
        );
        current = assertAllowedUrl(next, options.allowedHosts);
        continue;
      }

      const bytes = await readLimitedBody(response, maxBytes);

      return {
        status: response.status,
        ok: response.ok,
        finalUrl: current.toString(),
        headers: Object.fromEntries(response.headers.entries()),
        bytes
      };
    }

    throw new Error("Too many redirects");
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchSource(url: string, options: FetchSourceOptions) {
  const response = await fetchBinarySource(url, options);
  const text = new TextDecoder().decode(response.bytes);

  return {
    status: response.status,
    ok: response.ok,
    finalUrl: response.finalUrl,
    headers: response.headers,
    bodyBytes: response.bytes.byteLength,
    text: () => text,
    json: <T>() => JSON.parse(text) as T
  };
}

export async function browserSource(url: string, allowedHosts: string[]) {
  // V1 intentionally does not bundle a headless browser. Keep the interface
  // reserved for a future permitted source adapter, but fail closed today.
  assertAllowedUrl(url, allowedHosts);
  throw new Error(
    "Browser-backed source execution is not bundled in MangaFlux V1."
  );
}
