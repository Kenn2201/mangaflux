"use client";

import { useState } from "react";
import { notify } from "../lib/toast";
import ConfirmDialog from "./ConfirmDialog";

type MappingIdentity = {
  canonicalId: string;
  displayTitle: string;
  edition: {
    source: string;
    mangaId: string;
    sourceTitle: string;
    mappingMethod: string;
    provenance: string;
    createdAt: string;
    updatedAt: string;
  };
};

type MappingAudit = {
  id: string;
  source: string;
  mangaId: string;
  sourceTitle: string;
  action: string;
  fromCanonicalId: string;
  toCanonicalId: string;
  actorUserId: string;
  reason?: string | null;
  rollbackOf?: string | null;
  createdAt: string;
};

type MappingResponse = {
  identity: MappingIdentity;
  audit: MappingAudit[];
};

type PendingAction =
  | { type: "merge" }
  | { type: "split" }
  | { type: "rollback"; eventId: string }
  | null;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export default function CanonicalMappingAdmin() {
  const [source, setSource] = useState("mangadex");
  const [mangaId, setMangaId] = useState("");
  const [targetCanonicalId, setTargetCanonicalId] = useState("");
  const [reason, setReason] = useState("");
  const [data, setData] = useState<MappingResponse | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  async function loadMapping() {
    const cleanSource = source.trim();
    const cleanMangaId = mangaId.trim();

    if (!cleanSource || !cleanMangaId || loading || busy) return;

    setLoading(true);
    setMessage("");

    try {
      const query = new URLSearchParams({
        source: cleanSource,
        mangaId: cleanMangaId
      });

      const response = await fetch(
        `/api/admin/canonical/mapping?${query.toString()}`,
        { cache: "no-store" }
      );
      const payload = (await response.json().catch(() => null)) as
        | (MappingResponse & { message?: string })
        | null;

      if (!response.ok || !payload?.identity) {
        throw new Error(
          payload?.message ?? "Canonical mapping could not be loaded."
        );
      }

      setData(payload);
    } catch (error) {
      setData(null);
      setMessage(
        error instanceof Error
          ? error.message
          : "Canonical mapping could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  async function runAction(action: Exclude<PendingAction, null>) {
    if (busy) return;

    const body: Record<string, string> = {
      action: action.type,
      reason: reason.trim()
    };

    if (action.type === "rollback") {
      body.eventId = action.eventId;
    } else {
      body.source = source.trim();
      body.mangaId = mangaId.trim();

      if (action.type === "merge") {
        body.targetCanonicalId = targetCanonicalId.trim();
      }
    }

    setBusy(true);

    try {
      const response = await fetch("/api/admin/canonical/mapping", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mangaflux-client": "web"
        },
        body: JSON.stringify(body)
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.message ?? "Canonical mapping action failed."
        );
      }

      notify({
        tone: "success",
        title:
          action.type === "merge"
            ? "Edition merged"
            : action.type === "split"
              ? "Edition split"
              : "Mapping rolled back",
        message: payload?.message
      });

      if (action.type === "merge") {
        setTargetCanonicalId("");
      }

      await loadMapping();
    } catch (error) {
      notify({
        tone: "error",
        title: "Mapping review failed",
        message:
          error instanceof Error ? error.message : "Try again shortly."
      });
    } finally {
      setBusy(false);
    }
  }

  const activeRollbackIds = new Set(
    data?.audit
      .filter((event) => event.rollbackOf)
      .map((event) => event.rollbackOf as string) ?? []
  );

  return (
    <>
      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">Canonical identity</p>
            <h2>Mapping review & corrections</h2>
          </div>
          <span>Admin-only · audited</span>
        </div>

        <p>
          Inspect a source edition, merge it into a reviewed canonical manga,
          split an incorrect match, or roll back a previous mapping change.
          Source IDs and reader data remain unchanged.
        </p>

        <div className="admin-user-filters" aria-label="Canonical mapping lookup">
          <input
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="Source (mangadex / mangaster)"
            aria-label="Source"
            maxLength={40}
          />
          <input
            value={mangaId}
            onChange={(event) => setMangaId(event.target.value)}
            placeholder="Source manga ID"
            aria-label="Source manga ID"
            maxLength={500}
          />
          <button
            type="button"
            onClick={() => void loadMapping()}
            disabled={loading || busy || !source.trim() || !mangaId.trim()}
          >
            {loading ? "Loading…" : "Inspect mapping"}
          </button>
        </div>

        {message ? <p className="message">{message}</p> : null}

        {data ? (
          <div className="admin-list">
            <article className="admin-route-row">
              <div>
                <strong>{data.identity.displayTitle}</strong>
                <span>
                  {data.identity.edition.source} · {data.identity.edition.sourceTitle}
                </span>
              </div>
              <small>
                Canonical {data.identity.canonicalId}
                {" · "}
                {data.identity.edition.mappingMethod}
                {" · "}
                {data.identity.edition.provenance}
              </small>
            </article>

            <div className="admin-user-filters" aria-label="Canonical mapping actions">
              <input
                value={targetCanonicalId}
                onChange={(event) => setTargetCanonicalId(event.target.value)}
                placeholder="Target canonical UUID for merge"
                aria-label="Target canonical UUID"
                maxLength={36}
              />
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Optional review reason"
                aria-label="Mapping review reason"
                maxLength={500}
              />
              <button
                type="button"
                disabled={busy || !targetCanonicalId.trim()}
                onClick={() => setPendingAction({ type: "merge" })}
              >
                Merge into target
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setPendingAction({ type: "split" })}
              >
                Split edition
              </button>
            </div>

            <div>
              <p className="eyebrow">Audit history</p>
              <div className="admin-route-list">
                {data.audit.length ? (
                  data.audit.map((event) => {
                    const canRollback =
                      event.action !== "rollback" &&
                      !activeRollbackIds.has(event.id) &&
                      data.identity.canonicalId === event.toCanonicalId;

                    return (
                      <div className="admin-route-row" key={event.id}>
                        <div>
                          <strong>{event.action}</strong>
                          <span>
                            {event.fromCanonicalId} → {event.toCanonicalId}
                          </span>
                        </div>
                        <small>
                          {formatDate(event.createdAt)}
                          {event.reason ? ` · ${event.reason}` : ""}
                        </small>
                        {canRollback ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setPendingAction({
                                type: "rollback",
                                eventId: event.id
                              })
                            }
                          >
                            Roll back
                          </button>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="admin-empty">
                    No manual mapping changes have been recorded for this edition.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={
          pendingAction?.type === "merge"
            ? "Merge this source edition?"
            : pendingAction?.type === "split"
              ? "Split this source edition?"
              : "Roll back this mapping change?"
        }
        description={
          pendingAction?.type === "merge"
            ? "The edition will move under the target canonical MangaFlux identity. Its original source and manga ID stay unchanged, and the operation is recorded for rollback."
            : pendingAction?.type === "split"
              ? "The edition will receive a new canonical MangaFlux identity. Its source ID, reader links, bookmarks, and progress remain source-aware and unchanged."
              : "The edition will return to the canonical identity recorded before this audit event. A rollback event will be appended to the audit trail."
        }
        confirmLabel={
          pendingAction?.type === "merge"
            ? "Merge edition"
            : pendingAction?.type === "split"
              ? "Split edition"
              : "Roll back mapping"
        }
        danger
        busy={busy}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          const action = pendingAction;
          setPendingAction(null);
          if (action) void runAction(action);
        }}
      />
    </>
  );
}
