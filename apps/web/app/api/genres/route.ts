import { NextResponse } from "next/server";
import { publicProxyHeaders } from "../../../lib/publicProxyCache";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}/api/genres`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(15_000)
      }
    );

    const body = await upstream.text();

    return new NextResponse(body, {
      status: upstream.status,
      headers: publicProxyHeaders(
        upstream,
        "public, max-age=21600, s-maxage=21600, stale-while-revalidate=43200"
      )
    });
  } catch (error) {
    console.error("MangaFlux genres proxy failed", error);

    return NextResponse.json(
      {
        error: "API_UNAVAILABLE",
        message: "Genres are temporarily unavailable."
      },
      { status: 502 }
    );
  }
}
