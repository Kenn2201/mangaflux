export function publicProxyHeaders(
  upstream: Response,
  fallbackCacheControl: string
) {
  return {
    "content-type":
      upstream.headers.get("content-type") ?? "application/json",
    "cache-control": upstream.ok
      ? upstream.headers.get("cache-control") ?? fallbackCacheControl
      : "no-store"
  };
}
