import {
  NextRequest,
  NextResponse
} from "next/server";
import { forwardReaderState } from "../../../../lib/stateProxy";

export const dynamic = "force-dynamic";

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
    (readerId) =>
      `/api/state/${encodeURIComponent(readerId)}/bookmark?source=${encodeURIComponent(source)}&mangaId=${encodeURIComponent(mangaId)}`
  );
}

export async function PUT(request: NextRequest) {
  let payload: unknown;

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

  return forwardReaderState(
    request,
    (readerId) =>
      `/api/state/${encodeURIComponent(readerId)}/bookmark`,
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
    (readerId) =>
      `/api/state/${encodeURIComponent(readerId)}/bookmark?source=${encodeURIComponent(source)}&mangaId=${encodeURIComponent(mangaId)}`,
    { method: "DELETE" }
  );
}
