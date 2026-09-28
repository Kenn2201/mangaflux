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
  const source = request.nextUrl.searchParams.get("source")?.trim() || "mangadex";
  if (!/^[a-z0-9-]{1,40}$/.test(source)) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  const dataSaver = request.nextUrl.searchParams.get("dataSaver") === "true";

  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}/api/chapter/${encodeURIComponent(source)}/${encodeURIComponent(chapterId)}/pages?dataSaver=${dataSaver}`,
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
