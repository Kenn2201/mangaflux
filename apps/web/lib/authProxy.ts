import { NextResponse } from "next/server";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

export function getAuthProxySecret() {
  return process.env.MANGAFLUX_AUTH_PROXY_SECRET?.trim() ?? "";
}

export function authUnavailableResponse() {
  return NextResponse.json(
    {
      error: "AUTH_UNAVAILABLE",
      message: "Authentication is not configured yet."
    },
    { status: 503 }
  );
}

export async function callAuthApi(
  path: string,
  init: RequestInit = {}
) {
  const secret = getAuthProxySecret();
  if (!secret) return null;

  const headers = new Headers(init.headers);
  headers.set("x-mangaflux-auth-proxy", secret);

  return fetch(
    `${API_URL.replace(/\/$/, "")}${path}`,
    {
      ...init,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000)
    }
  );
}
