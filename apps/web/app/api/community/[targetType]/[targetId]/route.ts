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

export async function GET(
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
  const { targetType, targetId } = await params;
  const limit = request.nextUrl.searchParams.get("limit") ?? "20";
  const offset = request.nextUrl.searchParams.get("offset") ?? "0";
  const token = getSessionToken(request);

  const upstream = await callAuthApi(
    `/api/community/${encodeURIComponent(
      targetType
    )}/${encodeURIComponent(targetId)}?limit=${encodeURIComponent(
      limit
    )}&offset=${encodeURIComponent(offset)}`,
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
