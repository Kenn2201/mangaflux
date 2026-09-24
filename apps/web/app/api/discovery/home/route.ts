import { NextResponse } from "next/server";
import { publicProxyHeaders } from "../../../../lib/publicProxyCache";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}/api/discovery/home`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(20_000)
      }
    );

    const body = await upstream.text();

    return new NextResponse(body, {
      status: upstream.status,
      headers: publicProxyHeaders(
        upstream,
        "public, max-age=60, s-maxage=60, stale-while-revalidate=120"
      )
    });
  } catch (error) {
    console.error("MangaFlux home discovery proxy failed", error);

    return NextResponse.json(
      {
        error: "API_UNAVAILABLE",
        message: "MangaFlux discovery is temporarily unavailable."
      },
      { status: 502 }
    );
  }
}
