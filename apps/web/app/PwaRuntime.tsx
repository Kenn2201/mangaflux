"use client";

import { useEffect, useState } from "react";

export default function PwaRuntime() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // The website remains fully usable if service-worker registration fails.
      });
    }

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <div
      className={online ? "network-status is-online" : "network-status is-offline"}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {online ? <span className="sr-only">MangaFlux is online.</span> : "Offline · live manga data is temporarily unavailable"}
    </div>
  );
}
