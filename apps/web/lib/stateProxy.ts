import {
  NextRequest,
  NextResponse
} from "next/server";
import {
  attachReaderCookie,
  getReaderIdentity
} from "./readerIdentity";
import { getSessionToken } from "./authSession";
import { getAuthProxySecret } from "./authProxy";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

export async function forwardReaderState(
  request: NextRequest,
  paths: {
    reader: (readerId: string) => string;
    account: string;
  },
  init: RequestInit = {}
) {
  const sessionToken = getSessionToken(request);
  const authSecret = getAuthProxySecret();
  const reader = getReaderIdentity(request);
  const headers = new Headers(init.headers);

  let path: string;

  if (sessionToken) {
    if (!authSecret) {
      return NextResponse.json(
        {
          error: "AUTH_UNAVAILABLE",
          message: "Account persistence is temporarily unavailable."
        },
        { status: 503 }
      );
    }

    headers.set(
      "authorization",
      `Bearer ${sessionToken}`
    );
    headers.set(
      "x-mangaflux-auth-proxy",
      authSecret
    );
    path = paths.account;
  } else {
    path = paths.reader(reader.id);
  }

  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}${path}`,
      {
        ...init,
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(15_000)
      }
    );

    const body = await upstream.text();
    const response = new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store"
      }
    });

    return attachReaderCookie(response, reader);
  } catch (error) {
    console.error("MangaFlux state proxy failed", error);

    const response = NextResponse.json(
      {
        error: "PERSISTENCE_UNAVAILABLE",
        message: "Reading persistence is temporarily unavailable."
      },
      { status: 502 }
    );

    return attachReaderCookie(response, reader);
  }
}
