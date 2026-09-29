import {
  NextRequest,
  NextResponse
} from "next/server";
import {
  authUnavailableResponse,
  callAuthApi
} from "../../../../../lib/authProxy";
import { getSessionToken } from "../../../../../lib/authSession";

export const dynamic = "force-dynamic";

function unauthenticated() {
  return NextResponse.json(
    {
      error: "UNAUTHENTICATED",
      message: "Sign in is required."
    },
    { status: 401 }
  );
}

function forward(upstream: Response) {
  return upstream.text().then(
    (body) =>
      new NextResponse(body, {
        status: upstream.status,
        headers: {
          "content-type":
            upstream.headers.get("content-type") ?? "application/json",
          "cache-control": "no-store"
        }
      })
  );
}

export async function GET(request: NextRequest) {
  const token = getSessionToken(request);
  if (!token) return unauthenticated();

  const source = request.nextUrl.searchParams.get("source")?.trim() ?? "";
  const mangaId = request.nextUrl.searchParams.get("mangaId")?.trim() ?? "";
  const query = new URLSearchParams({ source, mangaId });

  const upstream = await callAuthApi(
    `/api/admin/canonical/mapping?${query.toString()}`,
    {
      headers: {
        authorization: `Bearer ${token}`
      }
    }
  );

  if (!upstream) return authUnavailableResponse();
  return forward(upstream);
}

export async function POST(request: NextRequest) {
  const token = getSessionToken(request);
  if (!token) return unauthenticated();

  const body = await request.text();
  const upstream = await callAuthApi("/api/admin/canonical/mapping", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body
  });

  if (!upstream) return authUnavailableResponse();
  return forward(upstream);
}
