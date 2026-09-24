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
    params: Promise<{
      targetType: string;
      targetId: string;
    }>;
  }
) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Request rejected." },
      { status: 403 }
    );
  }

  const token = getSessionToken(request);
  if (!token) {
    return NextResponse.json(
      {
        error: "UNAUTHENTICATED",
        message: "Sign in to post comments."
      },
      { status: 401 }
    );
  }

  let payload: { body?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { targetType, targetId } = await params;

  const upstream = await callAuthApi(
    `/api/community/${encodeURIComponent(
      targetType
    )}/${encodeURIComponent(targetId)}/comments`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
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
