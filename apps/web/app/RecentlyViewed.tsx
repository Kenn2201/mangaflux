"use client";

import {
  useEffect,
  useState
} from "react";
import MangaTile from "./MangaTile";
import { notify } from "../lib/toast";
import {
  clearRecentlyViewed,
  readRecentlyViewed,
  RECENTLY_VIEWED_EVENT,
  removeRecentlyViewed,
  type RecentlyViewedItem
} from "../lib/recentlyViewed";

export default function RecentlyViewed({
  compact = false
}: {
  compact?: boolean;
}) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function sync() {
      setItems(readRecentlyViewed());
      setLoaded(true);
    }

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(RECENTLY_VIEWED_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(RECENTLY_VIEWED_EVENT, sync);
    };
  }, []);

  if (!loaded || !items.length) return null;

  function remove(id: string) {
    if (!removeRecentlyViewed(id)) {
      notify({
        tone: "error",
        title: "Could not update recent views",
        message: "Browser storage is unavailable."
      });
    }
  }

  function clear() {
    if (!clearRecentlyViewed()) {
      notify({
        tone: "error",
        title: "Could not clear recent views",
        message: "Browser storage is unavailable."
      });
      return;
    }

    notify({
      tone: "success",
      title: "Recent views cleared",
      message: "Your device-local manga view history was cleared."
    });
  }

  return (
    <section
      className={`recently-viewed ${compact ? "is-compact" : ""}`}
      aria-label="Recently viewed manga"
    >
      <div className="discovery-heading recently-viewed-heading">
        <div>
          <p className="eyebrow">On this device</p>
          <h2>Recently viewed</h2>
          {!compact ? (
            <p>
              Manga pages you opened recently. This list stays on this device.
            </p>
          ) : null}
        </div>

        <button
          type="button"
          className="recently-viewed-clear"
          onClick={clear}
        >
          Clear all
        </button>
      </div>

      <div className="discovery-rail">
        {items.map((item) => (
          <div className="recently-viewed-entry" key={item.id}>
            <MangaTile item={item} />
            <button
              type="button"
              className="recently-viewed-remove"
              onClick={() => remove(item.id)}
              aria-label={`Remove ${item.title} from recently viewed`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
