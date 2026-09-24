import {
  NextRequest,
  NextResponse
} from "next/server";
import {
  authUnavailableResponse,
  callAuthApi
} from "../../../../../lib/authProxy";
import { getSessionToken } from "../../../../../lib/authSession";
import { isTrustedMutation } from "../../../../../lib/requestSecurity";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  {
    params
  }: {
    params: Promise<{ commentId: string }>;
  }
) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: "Request rejected."
      },
      { status: 403 }
    );
  }

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

  const { commentId } = await params;

  const upstream = await callAuthApi(
    `/api/admin/comments/${encodeURIComponent(commentId)}`,
    {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`
      }
    }
  );

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
