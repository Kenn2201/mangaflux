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
    (readerId) =>
      `/api/state/${encodeURIComponent(readerId)}/progress`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }
  );
}
