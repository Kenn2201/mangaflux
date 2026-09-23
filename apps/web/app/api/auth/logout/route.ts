import {
  NextRequest,
  NextResponse
} from "next/server";
import { callAuthApi } from "../../../../lib/authProxy";
import {
  clearSessionCookie,
  getSessionToken
} from "../../../../lib/authSession";
import { isTrustedMutation } from "../../../../lib/requestSecurity";

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Request rejected." },
      { status: 403 }
    );
  }

  const token = getSessionToken(request);

  if (token) {
    try {
      await callAuthApi("/api/auth/logout", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`
        }
      });
    } catch {
      // Local sign-out must still succeed if the API is temporarily offline.
    }
  }

  const response = NextResponse.json({ ok: true });
  return clearSessionCookie(response);
}
