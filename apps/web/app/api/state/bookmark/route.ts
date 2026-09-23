import {
  NextRequest,
  NextResponse
} from "next/server";
import { forwardReaderState } from "../../../../lib/stateProxy";

export const dynamic = "force-dynamic";

function paths(source: string, mangaId: string) {
  const query =
    `?source=${encodeURIComponent(source)}&mangaId=${encodeURIComponent(mangaId)}`;

  return {
    reader: (readerId: string) =>
      `/api/state/${encodeURIComponent(readerId)}/bookmark${query}`,
    account: `/api/account/state/bookmark${query}`
  };
}

export async function GET(request: NextRequest) {
  const source =
    request.nextUrl.searchParams.get("source") ?? "mangadex";
  const mangaId =
    request.nextUrl.searchParams.get("mangaId")?.trim();

  if (!mangaId) {
    return NextResponse.json(
      {
        error: "INVALID_REQUEST",
        message: "Missing mangaId"
      },
      { status: 400 }
    );
  }

  return forwardReaderState(
    request,
    paths(source, mangaId)
  );
}

export async function PUT(request: NextRequest) {
  let payload: {
    source?: string;
    mangaId?: string;
    title?: string;
    coverUrl?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "INVALID_REQUEST",
        message: "Invalid JSON body"
      },
      { status: 400 }
    );
  }

  const source = payload.source ?? "mangadex";
  const mangaId = payload.mangaId?.trim();

  if (!mangaId) {
    return NextResponse.json(
      {
        error: "INVALID_REQUEST",
        message: "Missing mangaId"
      },
      { status: 400 }
    );
  }

  return forwardReaderState(
    request,
    {
      reader: (readerId) =>
        `/api/state/${encodeURIComponent(readerId)}/bookmark`,
      account: "/api/account/state/bookmark"
    },
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }
  );
}

export async function DELETE(request: NextRequest) {
  const source =
    request.nextUrl.searchParams.get("source") ?? "mangadex";
  const mangaId =
    request.nextUrl.searchParams.get("mangaId")?.trim();

  if (!mangaId) {
    return NextResponse.json(
      {
        error: "INVALID_REQUEST",
        message: "Missing mangaId"
      },
      { status: 400 }
    );
  }

  return forwardReaderState(
    request,
    paths(source, mangaId),
    { method: "DELETE" }
  );
}
