import { NextResponse } from "next/server";
import { publicProxyHeaders } from "../../../../lib/publicProxyCache";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}/api/manga/mangadex/${encodeURIComponent(id)}`,
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
        "public, max-age=300, s-maxage=300, stale-while-revalidate=600"
      )
    });
  } catch (error) {
    console.error("MangaFlux manga proxy failed", error);

    return NextResponse.json(
      {
        error: "API_UNAVAILABLE",
        message: "MangaFlux manga API is temporarily unavailable."
      },
      { status: 502 }
    );
  }
}
