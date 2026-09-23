import type { NextRequest } from "next/server";

const allowedDevOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);

export function isTrustedMutation(request: NextRequest) {
  if (request.headers.get("x-mangaflux-client") !== "web") {
    return false;
  }

  const origin = request.headers.get("origin");
  if (!origin) return false;

  if (process.env.NODE_ENV !== "production") {
    return (
      allowedDevOrigins.has(origin) ||
      origin === request.nextUrl.origin
    );
  }

  return origin === request.nextUrl.origin;
}
