"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PREFERRED_STATUS_EVENT,
  readPreferredStatus,
  writePreferredStatus,
  type PreferredStatus
} from "./statusPreferences";

export function usePreferredStatus() {
  const [status, setStatusState] = useState<PreferredStatus | null>(null);

  useEffect(() => {
    function sync(event?: Event) {
      if (event instanceof CustomEvent) {
        setStatusState((event.detail ?? null) as PreferredStatus | null);
        return;
      }
      setStatusState(readPreferredStatus());
    }

    sync();
    window.addEventListener(PREFERRED_STATUS_EVENT, sync);
    return () => window.removeEventListener(PREFERRED_STATUS_EVENT, sync);
  }, []);

  const setStatus = useCallback((value: PreferredStatus | null) => {
    if (!writePreferredStatus(value)) return false;
    setStatusState(value);
    return true;
  }, []);

  return { status, setStatus };
}
