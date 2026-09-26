"use client";

import {
  preferredStatusOptions,
  type PreferredStatus
} from "../lib/statusPreferences";
import { usePreferredStatus } from "../lib/usePreferredStatus";
import { notify } from "../lib/toast";

export default function StatusPreference() {
  const { status, setStatus } = usePreferredStatus();

  function update(value: string) {
    const next = value ? (value as PreferredStatus) : null;
    if (!setStatus(next)) {
      notify({
        tone: "error",
        title: "Could not save status preference",
        message: "Browser storage is unavailable."
      });
    }
  }

  return (
    <section className="status-preference" aria-label="Preferred manga status">
      <div>
        <strong>Preferred manga status</strong>
        <span>
          Optional. Personalizes Hot, Popular, Trending, and your preference rails on this device.
        </span>
      </div>
      <select
        aria-label="Preferred manga status"
        value={status ?? ""}
        onChange={(event) => update(event.target.value)}
      >
        <option value="">Any status</option>
        {preferredStatusOptions.map(([value, label]) => (
          <option value={value} key={value}>{label}</option>
        ))}
      </select>
    </section>
  );
}
