import {
  NextRequest,
  NextResponse
} from "next/server";
import {
  authUnavailableResponse,
  callAuthApi
} from "../../../../../../lib/authProxy";
import { getSessionToken } from "../../../../../../lib/authSession";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  {
    params
  }: {
    params: Promise<{ userId: string }>;
  }
) {
  const { userId } = await params;
  const token = getSessionToken(request);
  const query = request.nextUrl.searchParams.toString();
  const suffix = query ? `?${query}` : "";

  const upstream = await callAuthApi(
    `/api/community/users/${encodeURIComponent(userId)}/activity${suffix}`,
    {
      headers: token
        ? { authorization: `Bearer ${token}` }
        : undefined
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
