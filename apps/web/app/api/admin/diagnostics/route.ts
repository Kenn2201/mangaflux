import {
  NextRequest,
  NextResponse
} from "next/server";
import {
  authUnavailableResponse,
  callAuthApi
} from "../../../../lib/authProxy";
import { getSessionToken } from "../../../../lib/authSession";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = getSessionToken(request);

  if (!token) {
    return NextResponse.json(
      {
        error: "UNAUTHENTICATED",
        message: "Sign in is required."
      },
      { status: 401 }
    );
  }

  const upstream = await callAuthApi("/api/admin/diagnostics", {
    headers: {
      authorization: `Bearer ${token}`
    }
  });

  if (!upstream) return authUnavailableResponse();

  const body = await upstream.text();

  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store"
    }
  });
}
