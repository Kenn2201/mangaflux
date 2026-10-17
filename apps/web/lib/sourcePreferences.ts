export const SOURCE_PREFERENCE_CHANGED = "mangaflux:source-preference-changed";
const PREFIX = "mangaflux:canonical-preferred-source:v1:";
const SOURCE_RE = /^[a-z0-9-]{1,40}$/;
const CANONICAL_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function storageKey(canonicalId: string) {
  return PREFIX + canonicalId;
}

export function getPreferredSource(canonicalId: string) {
  if (typeof window === "undefined" || !CANONICAL_RE.test(canonicalId)) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(storageKey(canonicalId));
    return value && SOURCE_RE.test(value) ? value : null;
  } catch {
    return null;
  }
}

export function savePreferredSource(
  canonicalId: string,
  source: string | null
) {
  if (
    typeof window === "undefined" ||
    !CANONICAL_RE.test(canonicalId) ||
    (source !== null && !SOURCE_RE.test(source))
  ) {
    return false;
  }

  try {
    const key = storageKey(canonicalId);
    if (source) {
      window.localStorage.setItem(key, source);
    } else {
      window.localStorage.removeItem(key);
    }
    window.dispatchEvent(
      new CustomEvent(SOURCE_PREFERENCE_CHANGED, {
        detail: { canonicalId, source }
      })
    );
    return true;
  } catch {
    return false;
  }
}
