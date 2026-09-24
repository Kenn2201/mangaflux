import { NextResponse } from "next/server";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}/api/status`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000)
      }
    );

    const body = await upstream.text();

    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    console.error("MangaFlux status proxy failed", error);

    return NextResponse.json(
      {
        ok: false,
        status: "unavailable",
        service: "mangaflux-web",
        message: "The MangaFlux API is temporarily unreachable."
      },
      { status: 503 }
    );
  }
}
