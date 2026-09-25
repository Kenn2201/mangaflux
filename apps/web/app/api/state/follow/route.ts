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

function queryPath(request: NextRequest) {
  const source =
    request.nextUrl.searchParams.get("source") ?? "mangadex";
  const mangaId =
    request.nextUrl.searchParams.get("mangaId")?.trim();

  if (!mangaId) return null;

  return `/api/account/state/follow?source=${encodeURIComponent(
    source
  )}&mangaId=${encodeURIComponent(mangaId)}`;
}

async function forward(
  request: NextRequest,
  path: string,
  init: RequestInit = {}
) {
  const token = getSessionToken(request);

  if (!token) {
    return NextResponse.json(
      {
        error: "UNAUTHENTICATED",
        message: "Sign in to follow manga."
      },
      { status: 401 }
    );
  }

  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token}`);

  const upstream = await callAuthApi(path, {
    ...init,
    headers
  });

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
  const path = queryPath(request);

  if (!path) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Missing mangaId" },
      { status: 400 }
    );
  }

  return forward(request, path);
}

export async function PUT(request: NextRequest) {
  let payload: {
    source?: string;
    mangaId?: string;
    title?: string;
    coverUrl?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!payload.mangaId?.trim()) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Missing mangaId" },
      { status: 400 }
    );
  }

  return forward(request, "/api/account/state/follow", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function PATCH(request: NextRequest) {
  let payload: {
    source?: string;
    mangaId?: string;
    notificationsEnabled?: boolean;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (
    !payload.mangaId?.trim() ||
    typeof payload.notificationsEnabled !== "boolean"
  ) {
    return NextResponse.json(
      {
        error: "INVALID_REQUEST",
        message: "mangaId and notificationsEnabled are required."
      },
      { status: 400 }
    );
  }

  return forward(request, "/api/account/state/follow", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function DELETE(request: NextRequest) {
  const path = queryPath(request);

  if (!path) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Missing mangaId" },
      { status: 400 }
    );
  }

  return forward(request, path, { method: "DELETE" });
}
