import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;
  const dataSaver = request.nextUrl.searchParams.get("dataSaver") === "true";

  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}/api/chapter/mangadex/${encodeURIComponent(chapterId)}/pages?dataSaver=${dataSaver}`,
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
    console.error("MangaFlux reader proxy failed", error);

    return NextResponse.json(
      {
        error: "API_UNAVAILABLE",
        message: "MangaFlux reader API is temporarily unavailable."
      },
      { status: 502 }
    );
  }
}
