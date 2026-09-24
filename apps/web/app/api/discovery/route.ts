import { NextRequest, NextResponse } from "next/server";
import { publicProxyHeaders } from "../../../lib/publicProxyCache";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

const kinds = new Set(["hot", "popular", "top", "latest"]);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind") ?? "popular";
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "24");
  const offset = Number(request.nextUrl.searchParams.get("offset") ?? "0");
  const tag = request.nextUrl.searchParams.get("tag")?.trim();
  const creator = request.nextUrl.searchParams.get("creator")?.trim();
  const status = request.nextUrl.searchParams.get("status")?.trim();
  const yearValue = request.nextUrl.searchParams.get("year")?.trim();
  const year = yearValue ? Number(yearValue) : undefined;

  if (
    !kinds.has(kind) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 50 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset > 10_000 ||
    (year !== undefined &&
      (!Number.isInteger(year) || year < 1900 || year > 2100))
  ) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid discovery request" },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    kind,
    limit: String(limit),
    offset: String(offset)
  });

  if (tag) params.set("tag", tag);
  if (creator) params.set("creator", creator);
  if (status) params.set("status", status);
  if (year !== undefined) params.set("year", String(year));

  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}/api/discovery?${params.toString()}`,
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
        "public, max-age=60, s-maxage=60, stale-while-revalidate=120"
      )
    });
  } catch (error) {
    console.error("MangaFlux discovery proxy failed", error);

    return NextResponse.json(
      {
        error: "API_UNAVAILABLE",
        message: "MangaFlux discovery is temporarily unavailable."
      },
      { status: 502 }
    );
  }
}
