import type {
  NextRequest,
  NextResponse
} from "next/server";

const SESSION_COOKIE = "mf_session_v1";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export function getSessionToken(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE)?.value ?? null;
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: string
) {
  const parsedExpiry = new Date(expiresAt);
  const maxAge = Number.isNaN(parsedExpiry.getTime())
    ? THIRTY_DAYS
    : Math.max(
        60,
        Math.floor((parsedExpiry.getTime() - Date.now()) / 1000)
      );

  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  });

  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  return response;
}
