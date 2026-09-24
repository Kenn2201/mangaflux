import { NextRequest, NextResponse } from "next/server";
import { publicProxyHeaders } from "../../../../../lib/publicProxyCache";

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
  const language =
    request.nextUrl.searchParams.get("language")?.trim() || "en";
  const rawLimit = Number(
    request.nextUrl.searchParams.get("limit") ?? "50"
  );
  const rawOffset = Number(
    request.nextUrl.searchParams.get("offset") ?? "0"
  );
  const order = request.nextUrl.searchParams.get("order") ?? "desc";
  const chapter = request.nextUrl.searchParams.get("chapter")?.trim();

  const limit =
    Number.isInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 100
      ? rawLimit
      : 50;
  const offset =
    Number.isInteger(rawOffset) && rawOffset >= 0 && rawOffset <= 10_000
      ? rawOffset
      : 0;
  const normalizedOrder = order === "asc" ? "asc" : "desc";

  const query = new URLSearchParams({
    language,
    limit: String(limit),
    offset: String(offset),
    order: normalizedOrder
  });

  if (chapter) {
    query.set("chapter", chapter);
  }

  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}/api/manga/mangadex/${encodeURIComponent(
        id
      )}/chapters?${query.toString()}`,
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
