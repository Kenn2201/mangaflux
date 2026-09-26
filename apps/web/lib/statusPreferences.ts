export type PreferredStatus =
  | "ongoing"
  | "completed"
  | "hiatus"
  | "cancelled";

export const PREFERRED_STATUS_EVENT =
  "mangaflux:preferred-status-changed";
const STORAGE_KEY = "mangaflux:preferred-status:v1";

export const preferredStatusOptions: ReadonlyArray<
  readonly [PreferredStatus, string]
> = [
  ["ongoing", "Ongoing"],
  ["completed", "Completed"],
  ["hiatus", "Hiatus"],
  ["cancelled", "Cancelled"]
];

const supported = new Set<string>(
  preferredStatusOptions.map(([value]) => value)
);

export function readPreferredStatus(): PreferredStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return supported.has(value ?? "") ? (value as PreferredStatus) : null;
  } catch {
    return null;
  }
}

export function writePreferredStatus(value: PreferredStatus | null) {
  if (typeof window === "undefined") return false;
  if (value !== null && !supported.has(value)) return false;

  try {
    if (value === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, value);

    window.dispatchEvent(
      new CustomEvent<PreferredStatus | null>(PREFERRED_STATUS_EVENT, {
        detail: value
      })
    );
    return true;
  } catch {
    return false;
  }
}
