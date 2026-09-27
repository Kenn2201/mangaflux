import { NextRequest, NextResponse } from "next/server";
import { publicProxyHeaders } from "../../../lib/publicProxyCache";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const rawLimit = Number(
    request.nextUrl.searchParams.get("limit") ?? "24"
  );
  const limit =
    Number.isInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 24
      ? rawLimit
      : 24;
  const source = request.nextUrl.searchParams.get("source")?.trim();

  if (!query || query.length > 120) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Missing or invalid q parameter" },
      { status: 400 }
    );
  }

  const search = new URLSearchParams({
    q: query,
    limit: String(limit)
  });
  if (source) search.set("source", source);

  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}/api/search/unified?${search.toString()}`,
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
        "public, max-age=30, s-maxage=30, stale-while-revalidate=60"
      )
    });
  } catch (error) {
    console.error("MangaFlux search proxy failed", error);

    return NextResponse.json(
      {
        error: "API_UNAVAILABLE",
        message: "MangaFlux API is temporarily unavailable."
      },
      { status: 502 }
    );
  }
}
