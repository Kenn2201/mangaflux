import {
  NextRequest,
  NextResponse
} from "next/server";
import { forwardReaderState } from "../../../../lib/stateProxy";

export const dynamic = "force-dynamic";

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
    {
      reader: (readerId) =>
        `/api/state/${encodeURIComponent(readerId)}/progress`,
      account: "/api/account/state/progress"
    },
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }
  );
}


export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const all = url.searchParams.get("all");
  const olderThanDays = url.searchParams.get("olderThanDays");
  const source = url.searchParams.get("source") ?? "mangadex";
  const mangaId = url.searchParams.get("mangaId");

  const query = new URLSearchParams();

  if (olderThanDays) {
    query.set("olderThanDays", olderThanDays);
  } else if (all === "1") {
    query.set("all", "1");
  } else {
    query.set("source", source);
    if (mangaId) query.set("mangaId", mangaId);
  }

  const suffix = `?${query.toString()}`;

  return forwardReaderState(
    request,
    {
      reader: (readerId) =>
        `/api/state/${encodeURIComponent(readerId)}/progress${suffix}`,
      account: `/api/account/state/progress${suffix}`
    },
    {
      method: "DELETE"
    }
  );
}
