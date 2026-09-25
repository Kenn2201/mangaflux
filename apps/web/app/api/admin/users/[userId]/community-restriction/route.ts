import {
  NextRequest,
  NextResponse
} from "next/server";
import {
  authUnavailableResponse,
  callAuthApi
} from "../../../../../../lib/authProxy";
import { getSessionToken } from "../../../../../../lib/authSession";
import { isTrustedMutation } from "../../../../../../lib/requestSecurity";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  {
    params
  }: {
    params: Promise<{ userId: string }>;
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

  const { userId } = await params;
  const body = await request.text();

  const upstream = await callAuthApi(
    `/api/admin/users/${encodeURIComponent(
      userId
    )}/community-restriction`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body
    }
  );

  if (!upstream) return authUnavailableResponse();

  const responseBody = await upstream.text();

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store"
    }
  });
}
