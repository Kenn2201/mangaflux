import {
  NextRequest,
  NextResponse
} from "next/server";
import {
  authUnavailableResponse,
  callAuthApi
} from "../../../../lib/authProxy";
import { getSessionToken } from "../../../../lib/authSession";
import { isTrustedMutation } from "../../../../lib/requestSecurity";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Request rejected." },
      { status: 403 }
    );
  }

  const token = getSessionToken(request);
  if (!token) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED", message: "Sign in is required." },
      { status: 401 }
    );
  }

  let payload: {
    displayName?: string | null;
    avatarDataUrl?: string | null;
    bio?: string | null;
    showPublicActivity?: boolean;
    showJoinedDate?: boolean;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const upstream = await callAuthApi("/api/auth/profile", {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
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
