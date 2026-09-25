export const DISCOVERY_LANGUAGE_EVENT =
  "mangaflux:discovery-language-changed";
const STORAGE_KEY = "mangaflux:discovery-language:v1";
const DEFAULT_LANGUAGE = "en";

export const discoveryLanguageOptions = [
  ["en", "English"],
  ["ja", "Japanese"],
  ["ko", "Korean"],
  ["zh", "Chinese (Simplified)"],
  ["zh-hk", "Chinese (Traditional)"],
  ["es", "Spanish"],
  ["fr", "French"],
  ["de", "German"],
  ["it", "Italian"],
  ["pt-br", "Portuguese (Brazil)"],
  ["id", "Indonesian"],
  ["vi", "Vietnamese"],
  ["th", "Thai"]
] as const;

export type DiscoveryLanguage =
  (typeof discoveryLanguageOptions)[number][0];

const supported = new Set<string>(
  discoveryLanguageOptions.map(([value]) => value)
);

export function getDiscoveryLanguage(): DiscoveryLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  try {
    const value = window.localStorage.getItem(STORAGE_KEY)?.toLowerCase();
    return supported.has(value ?? "")
      ? (value as DiscoveryLanguage)
      : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function saveDiscoveryLanguage(value: string) {
  if (
    typeof window === "undefined" ||
    !supported.has(value.toLowerCase())
  ) {
    return false;
  }

  const language = value.toLowerCase() as DiscoveryLanguage;

  try {
    window.localStorage.setItem(STORAGE_KEY, language);
    window.dispatchEvent(
      new CustomEvent<DiscoveryLanguage>(DISCOVERY_LANGUAGE_EVENT, {
        detail: language
      })
    );
    return true;
  } catch {
    return false;
  }
}

export function discoveryLanguageLabel(value: string) {
  return (
    discoveryLanguageOptions.find(([language]) => language === value)?.[1] ??
    "English"
  );
}
