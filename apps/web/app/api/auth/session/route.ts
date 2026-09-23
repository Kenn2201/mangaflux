import {
  NextRequest,
  NextResponse
} from "next/server";
import {
  authUnavailableResponse,
  callAuthApi
} from "../../../../lib/authProxy";
import {
  clearSessionCookie,
  getSessionToken
} from "../../../../lib/authSession";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = getSessionToken(request);

  if (!token) {
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }

  const upstream = await callAuthApi("/api/auth/session", {
    headers: {
      authorization: `Bearer ${token}`
    }
  });

  if (!upstream) return authUnavailableResponse();

  const body = await upstream.text();
  const response = new NextResponse(body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store"
    }
  });

  if (upstream.status === 401) {
    clearSessionCookie(response);
  }

  return response;
}
