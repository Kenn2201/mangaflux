import {
  NextRequest,
  NextResponse
} from "next/server";
import { forwardReaderState } from "../../../../lib/stateProxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mangaId = url.searchParams.get("mangaId") ?? "";
  const suffix = `?mangaId=${encodeURIComponent(mangaId)}`;

  return forwardReaderState(
    request,
    {
      reader: (readerId) =>
        `/api/state/${encodeURIComponent(readerId)}/reader-preferences${suffix}`,
      account: `/api/account/state/reader-preferences${suffix}`
    }
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
    {
      reader: (readerId) =>
        `/api/state/${encodeURIComponent(readerId)}/reader-preferences`,
      account: "/api/account/state/reader-preferences"
    },
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }
  );
}
