import type { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "mf_reader_v1";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ReaderIdentity = {
  id: string;
  isNew: boolean;
};

export function getReaderIdentity(
  request: NextRequest
): ReaderIdentity {
  const existing = request.cookies.get(COOKIE_NAME)?.value;

  if (existing && UUID_RE.test(existing)) {
    return { id: existing, isNew: false };
  }

  return {
    id: crypto.randomUUID(),
    isNew: true
  };
}

export function attachReaderCookie(
  response: NextResponse,
  identity: ReaderIdentity
) {
  if (!identity.isNew) return response;

  response.cookies.set({
    name: COOKIE_NAME,
    value: identity.id,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}
