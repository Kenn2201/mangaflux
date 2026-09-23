import {
  NextRequest,
  NextResponse
} from "next/server";
import {
  attachReaderCookie,
  getReaderIdentity
} from "./readerIdentity";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

export async function forwardReaderState(
  request: NextRequest,
  path: (readerId: string) => string,
  init: RequestInit = {}
) {
  const identity = getReaderIdentity(request);
  const headers = new Headers(init.headers);

  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}${path(identity.id)}`,
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

    return attachReaderCookie(response, identity);
  } catch (error) {
    console.error("MangaFlux state proxy failed", error);

    const response = NextResponse.json(
      {
        error: "PERSISTENCE_UNAVAILABLE",
        message: "Reading persistence is temporarily unavailable."
      },
      { status: 502 }
    );

    return attachReaderCookie(response, identity);
  }
}
