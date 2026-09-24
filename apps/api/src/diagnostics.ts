import type {
  FastifyInstance,
  FastifyRequest
} from "fastify";

type RequestSample = {
  at: number;
  route: string;
  method: string;
  statusCode: number;
  durationMs: number;
};

const WINDOW_MS = 15 * 60_000;
const MAX_SAMPLES = 1_000;
const startedAt = new WeakMap<FastifyRequest, number>();
const samples: RequestSample[] = [];

function routeFor(request: FastifyRequest) {
  const route = request.routeOptions?.url;

  if (route) return route;

  return request.url.split("?")[0] || "unknown";
}

function prune(now = Date.now()) {
  const cutoff = now - WINDOW_MS;

  while (
    samples.length &&
    (samples[0].at < cutoff || samples.length > MAX_SAMPLES)
  ) {
    samples.shift();
  }
}

function percentile(values: number[], percentileValue: number) {
  if (!values.length) return 0;

  const ordered = [...values].sort((left, right) => left - right);
  const index = Math.min(
    ordered.length - 1,
    Math.max(
      0,
      Math.ceil((percentileValue / 100) * ordered.length) - 1
    )
  );

  return ordered[index];
}

export function attachDiagnostics(app: FastifyInstance) {
  app.addHook("onRequest", async (request) => {
    startedAt.set(request, Date.now());
  });

  app.addHook("onResponse", async (request, reply) => {
    const start = startedAt.get(request) ?? Date.now();
    const now = Date.now();

    samples.push({
      at: now,
      route: routeFor(request),
      method: request.method,
      statusCode: reply.statusCode,
      durationMs: Math.max(0, now - start)
    });

    prune(now);
  });
}

export function getDiagnosticsSnapshot() {
  prune();

  const active = [...samples];
  const durations = active.map((sample) => sample.durationMs);
  const totalDuration = durations.reduce(
    (sum, duration) => sum + duration,
    0
  );

  const routeMap = new Map<
    string,
    {
      route: string;
      method: string;
      requests: number;
      errors: number;
      totalDurationMs: number;
      maxDurationMs: number;
    }
  >();

  for (const sample of active) {
    const key = `${sample.method} ${sample.route}`;
    const current = routeMap.get(key) ?? {
      route: sample.route,
      method: sample.method,
      requests: 0,
      errors: 0,
      totalDurationMs: 0,
      maxDurationMs: 0
    };

    current.requests += 1;
    current.errors += sample.statusCode >= 500 ? 1 : 0;
    current.totalDurationMs += sample.durationMs;
    current.maxDurationMs = Math.max(
      current.maxDurationMs,
      sample.durationMs
    );

    routeMap.set(key, current);
  }

  const routes = [...routeMap.values()]
    .map((route) => ({
      route: route.route,
      method: route.method,
      requests: route.requests,
      errors: route.errors,
      averageLatencyMs: route.requests
        ? Math.round(route.totalDurationMs / route.requests)
        : 0,
      maxLatencyMs: route.maxDurationMs
    }))
    .sort((left, right) => right.requests - left.requests)
    .slice(0, 12);

  const recentFailures = active
    .filter(
      (sample) =>
        sample.statusCode >= 500 || sample.statusCode === 429
    )
    .slice(-20)
    .reverse();

  return {
    windowMinutes: WINDOW_MS / 60_000,
    requests: active.length,
    clientErrors: active.filter(
      (sample) =>
        sample.statusCode >= 400 &&
        sample.statusCode < 500 &&
        sample.statusCode !== 429
    ).length,
    rateLimited: active.filter(
      (sample) => sample.statusCode === 429
    ).length,
    serverErrors: active.filter(
      (sample) => sample.statusCode >= 500
    ).length,
    averageLatencyMs: durations.length
      ? Math.round(totalDuration / durations.length)
      : 0,
    p95LatencyMs: Math.round(percentile(durations, 95)),
    routes,
    recentFailures
  };
}
