import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const language = request.nextUrl.searchParams.get("language")?.trim() || "en";

  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}/api/manga/mangadex/${encodeURIComponent(id)}/chapters?language=${encodeURIComponent(language)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(20_000)
      }
    );

    const body = await upstream.text();

    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json"
      }
    });
  } catch (error) {
    console.error("MangaFlux chapters proxy failed", error);

    return NextResponse.json(
      {
        error: "API_UNAVAILABLE",
        message: "MangaFlux chapter API is temporarily unavailable."
      },
      { status: 502 }
    );
  }
}
