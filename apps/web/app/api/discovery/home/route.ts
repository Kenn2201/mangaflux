import { NextRequest, NextResponse } from "next/server";
import { publicProxyHeaders } from "../../../../lib/publicProxyCache";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const language =
    request.nextUrl.searchParams.get("language")?.trim().toLowerCase() ?? "en";
  const supported = new Set([
    "en",
    "ja",
    "ko",
    "zh",
    "zh-hk",
    "es",
    "fr",
    "de",
    "it",
    "pt-br",
    "id",
    "vi",
    "th"
  ]);

  if (!supported.has(language)) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid discovery language" },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(
      `${API_URL.replace(/\/$/, "")}/api/discovery/home?language=${encodeURIComponent(language)}`,
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
