"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { reliableFetch } from "../lib/reliableFetch";

type State = "checking" | "operational" | "degraded" | "unavailable";

export default function SystemStatusLink() {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await reliableFetch(
          "/api/status",
          { cache: "no-store" },
          { retries: 1, timeoutMs: 8_000 }
        );

        const payload = (await response.json()) as {
          status?: string;
        };

        if (!cancelled) {
          setState(
            payload.status === "operational"
              ? "operational"
              : payload.status === "degraded"
                ? "degraded"
                : "unavailable"
          );
        }
      } catch {
        if (!cancelled) setState("unavailable");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link className={`footer-status ${state}`} href="/status">
      <i aria-hidden="true" />
      <span>
        {state === "checking"
          ? "Checking status"
          : state === "operational"
            ? "All systems operational"
            : state === "degraded"
              ? "Some systems degraded"
              : "Status unavailable"}
      </span>
    </Link>
  );
}
