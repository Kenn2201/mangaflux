import { chromium } from "playwright";

export type FetchSourceOptions = {
  allowedHosts: string[];
  timeoutMs?: number;
  maxBytes?: number;
  init?: RequestInit;
};

export async function fetchSource(url: string, options: FetchSourceOptions) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") throw new Error("Only HTTPS sources are allowed");
  if (!options.allowedHosts.includes(parsed.hostname)) {
    throw new Error(`Host not allowed: ${parsed.hostname}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 12_000);

  try {
    const response = await fetch(url, { ...options.init, signal: controller.signal });
    const bytes = new Uint8Array(await response.arrayBuffer());
    const maxBytes = options.maxBytes ?? 5_000_000;
    if (bytes.byteLength > maxBytes) throw new Error("Response exceeds configured size limit");

    const text = new TextDecoder().decode(bytes);
    return {
      status: response.status,
      ok: response.ok,
      finalUrl: response.url,
      headers: Object.fromEntries(response.headers.entries()),
      text: () => text,
      json: <T>() => JSON.parse(text) as T
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function browserSource(url: string, allowedHosts: string[]) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !allowedHosts.includes(parsed.hostname)) {
    throw new Error("Browser source URL is not allowed");
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
    return { finalUrl: page.url(), html: await page.content() };
  } finally {
    await browser.close();
  }
}
