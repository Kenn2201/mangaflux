import { NextRequest } from "next/server";
import { forwardReaderState } from "../../../../lib/stateProxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return forwardReaderState(
    request,
    {
      reader: (readerId) =>
        `/api/state/${encodeURIComponent(readerId)}/summary`,
      account: "/api/account/state/summary"
    }
  );
}
