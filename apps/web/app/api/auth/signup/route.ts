import {
  NextRequest,
  NextResponse
} from "next/server";
import {
  authUnavailableResponse,
  callAuthApi
} from "../../../../lib/authProxy";
import {
  attachReaderCookie,
  getReaderIdentity
} from "../../../../lib/readerIdentity";
import { setSessionCookie } from "../../../../lib/authSession";
import { isTrustedMutation } from "../../../../lib/requestSecurity";

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Request rejected." },
      { status: 403 }
    );
  }

  let payload: { email?: string; password?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const reader = getReaderIdentity(request);
  const upstream = await callAuthApi("/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      readerId: reader.id
    })
  });

  if (!upstream) return authUnavailableResponse();

  const body = await upstream.json() as {
    user?: unknown;
    sessionToken?: string;
    expiresAt?: string;
    error?: string;
    message?: string;
  };

  if (!upstream.ok || !body.sessionToken || !body.expiresAt) {
    const response = NextResponse.json(
      {
        error: body.error ?? "SIGNUP_FAILED",
        message: body.message ?? "Signup failed."
      },
      { status: upstream.status }
    );

    return attachReaderCookie(response, reader);
  }

  const response = NextResponse.json(
    { authenticated: true, user: body.user },
    { status: 201 }
  );

  setSessionCookie(
    response,
    body.sessionToken,
    body.expiresAt
  );
  return attachReaderCookie(response, reader);
}
