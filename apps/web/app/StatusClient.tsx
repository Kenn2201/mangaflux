"use client";

import { useCallback, useEffect, useState } from "react";
import { reliableFetch } from "../lib/reliableFetch";

type HealthState =
  | "operational"
  | "degraded"
  | "unavailable"
  | "configured"
  | "disabled";

type StatusPayload = {
  ok: boolean;
  status: HealthState;
  service: string;
  version?: string;
  checkedAt?: string;
  uptimeSeconds?: number;
  message?: string;
  components?: {
    api?: {
      status: HealthState;
    };
    source?: {
      id: string;
      name: string;
      status: HealthState;
      latencyMs: number;
      checkedAt: string;
    };
    persistence?: {
      status: HealthState;
      latencyMs: number;
      checkedAt: string;
    };
    auth?: {
      status: HealthState;
    };
    email?: {
      status: HealthState;
    };
  };
};

function labelFor(status: HealthState | undefined) {
  if (!status) return "Unknown";

  return status
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ");
}

function toneFor(status: HealthState | undefined) {
  if (status === "operational" || status === "configured") {
    return "good";
  }

  if (status === "degraded" || status === "disabled") {
    return "warn";
  }

  return "bad";
}

function formatChecked(value?: string) {
  if (!value) return "Not checked";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not checked";

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

export default function StatusClient() {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await reliableFetch(
        "/api/status",
        { cache: "no-store" },
        { retries: 1, timeoutMs: 10_000 }
      );

      const payload = (await response.json()) as StatusPayload;
      setData(payload);
    } catch {
      setData({
        ok: false,
        status: "unavailable",
        service: "mangaflux-web",
        message: "The MangaFlux API is temporarily unreachable."
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const overall = data?.status;
  const source = data?.components?.source;
  const persistence = data?.components?.persistence;

  return (
    <main className="status-page">
      <section className="status-hero">
        <p className="eyebrow">MangaFlux status</p>
        <div className="status-title-row">
          <div>
            <h1>
              {loading
                ? "Checking systems…"
                : overall === "operational"
                  ? "All systems operational."
                  : "Some systems are degraded."}
            </h1>
            <p>
              Live health for MangaFlux, MangaDex connectivity, and core
              account persistence.
            </p>
          </div>

          <span
            className={`status-pill ${toneFor(overall)}`}
          >
            <i />
            {loading ? "Checking" : labelFor(overall)}
          </span>
        </div>

        <div className="status-actions">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? "Checking…" : "Refresh status"}
          </button>

          {data?.version ? (
            <span>API v{data.version}</span>
          ) : null}

          {data?.checkedAt ? (
            <span>Checked {formatChecked(data.checkedAt)}</span>
          ) : null}
        </div>

        {data?.message ? (
          <p className="status-message">{data.message}</p>
        ) : null}
      </section>

      <section className="status-grid" aria-busy={loading}>
        <article>
          <div className="status-card-heading">
            <div>
              <p className="eyebrow">Core</p>
              <h2>API</h2>
            </div>
            <span
              className={`status-dot ${toneFor(
                data?.components?.api?.status ??
                  (data?.status === "unavailable"
                    ? "unavailable"
                    : undefined)
              )}`}
            />
          </div>
          <strong>
            {labelFor(
              data?.components?.api?.status ??
                (data?.status === "unavailable"
                  ? "unavailable"
                  : undefined)
            )}
          </strong>
          <p>Fastify API, proxy boundary, and application routes.</p>
        </article>

        <article>
          <div className="status-card-heading">
            <div>
              <p className="eyebrow">Source</p>
              <h2>{source?.name ?? "MangaDex"}</h2>
            </div>
            <span
              className={`status-dot ${toneFor(source?.status)}`}
            />
          </div>
          <strong>{labelFor(source?.status)}</strong>
          <p>
            {source
              ? `${source.latencyMs} ms · checked ${formatChecked(
                  source.checkedAt
                )}`
              : "Waiting for source health."}
          </p>
        </article>

        <article>
          <div className="status-card-heading">
            <div>
              <p className="eyebrow">Data</p>
              <h2>Neon persistence</h2>
            </div>
            <span
              className={`status-dot ${toneFor(
                persistence?.status
              )}`}
            />
          </div>
          <strong>{labelFor(persistence?.status)}</strong>
          <p>
            {persistence?.status === "operational"
              ? `${persistence.latencyMs} ms database probe`
              : "Bookmarks, progress, accounts, and community data."}
          </p>
        </article>

        <article>
          <div className="status-card-heading">
            <div>
              <p className="eyebrow">Identity</p>
              <h2>Authentication</h2>
            </div>
            <span
              className={`status-dot ${toneFor(
                data?.components?.auth?.status
              )}`}
            />
          </div>
          <strong>
            {labelFor(data?.components?.auth?.status)}
          </strong>
          <p>Account sessions and protected server-to-server auth proxy.</p>
        </article>

        <article>
          <div className="status-card-heading">
            <div>
              <p className="eyebrow">Email</p>
              <h2>Transactional email</h2>
            </div>
            <span
              className={`status-dot ${toneFor(
                data?.components?.email?.status
              )}`}
            />
          </div>
          <strong>
            {labelFor(data?.components?.email?.status)}
          </strong>
          <p>
            Configuration status for verification and password-reset email.
          </p>
        </article>
      </section>

      <section className="panel status-note">
        <p className="eyebrow">What this means</p>
        <h2>Graceful degradation first.</h2>
        <p>
          If MangaDex is degraded, your MangaFlux account and saved library can
          still remain available. If persistence is degraded, discovery and
          reading may still work while account-backed saves wait for recovery.
        </p>
      </section>
    </main>
  );
}
