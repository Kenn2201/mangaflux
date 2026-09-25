"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";
import {
  DISCOVERY_LANGUAGE_EVENT,
  getDiscoveryLanguage,
  saveDiscoveryLanguage,
  type DiscoveryLanguage
} from "./discoveryPreferences";

export function useDiscoveryLanguage() {
  const [language, setLanguage] =
    useState<DiscoveryLanguage>("en");

  useEffect(() => {
    function sync(event?: Event) {
      if (event instanceof CustomEvent && typeof event.detail === "string") {
        setLanguage(event.detail as DiscoveryLanguage);
        return;
      }

      setLanguage(getDiscoveryLanguage());
    }

    sync();
    window.addEventListener(DISCOVERY_LANGUAGE_EVENT, sync);

    return () => {
      window.removeEventListener(DISCOVERY_LANGUAGE_EVENT, sync);
    };
  }, []);

  const updateLanguage = useCallback((value: string) => {
    if (saveDiscoveryLanguage(value)) {
      setLanguage(value as DiscoveryLanguage);
      return true;
    }

    return false;
  }, []);

  return {
    language,
    setLanguage: updateLanguage
  };
}
