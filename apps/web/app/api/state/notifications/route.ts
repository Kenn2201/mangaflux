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

async function forward(
  request: NextRequest,
  init: RequestInit = {}
) {
  const token = getSessionToken(request);

  if (!token) {
    return NextResponse.json(
      {
        error: "UNAUTHENTICATED",
        message: "Sign in to view notifications."
      },
      { status: 401 }
    );
  }

  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token}`);

  const limit = request.nextUrl.searchParams.get("limit");
  const path = `/api/account/state/notifications${limit ? `?limit=${encodeURIComponent(limit)}` : ""}`;
  const upstream = await callAuthApi(path, { ...init, headers });
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

  if (upstream.status === 401) clearSessionCookie(response);
  return response;
}

export async function GET(request: NextRequest) {
  return forward(request);
}

export async function PATCH(request: NextRequest) {
  let payload: { eventId?: string; all?: boolean };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  return forward(request, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}
