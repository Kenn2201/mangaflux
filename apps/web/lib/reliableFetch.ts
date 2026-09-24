const RETRY_STATUSES = new Set([
  408,
  425,
  429,
  500,
  502,
  503,
  504
]);

function retryDelay(response: Response | null, attempt: number) {
  const retryAfter = response?.headers.get("retry-after");

  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(3_000, seconds * 1_000);
    }
  }

  return attempt === 0 ? 350 : 900;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function reliableFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: {
    retries?: number;
    timeoutMs?: number;
  } = {}
) {
  const retries = Math.max(0, Math.min(3, options.retries ?? 2));
  const timeoutMs = Math.max(
    1_000,
    Math.min(30_000, options.timeoutMs ?? 12_000)
  );
  const externalSignal = init.signal;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (externalSignal?.aborted) {
      throw new DOMException("Request aborted", "AbortError");
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      timeoutMs
    );

    const forwardAbort = () => controller.abort();
    externalSignal?.addEventListener("abort", forwardAbort, {
      once: true
    });

    let response: Response | null = null;

    try {
      response = await fetch(input, {
        ...init,
        signal: controller.signal
      });

      if (
        !RETRY_STATUSES.has(response.status) ||
        attempt >= retries
      ) {
        return response;
      }
    } catch (error) {
      if (externalSignal?.aborted) {
        throw new DOMException("Request aborted", "AbortError");
      }

      if (attempt >= retries) throw error;
    } finally {
      window.clearTimeout(timeout);
      externalSignal?.removeEventListener(
        "abort",
        forwardAbort
      );
    }

    await wait(retryDelay(response, attempt));
  }

  throw new Error("Request failed after retries.");
}
