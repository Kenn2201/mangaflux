"use client";

import {
  useEffect,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { notify } from "../lib/toast";
import {
  announceSearchQuery,
  clearSearchHistory,
  readSearchHistory,
  removeSearchHistory,
  SEARCH_HISTORY_EVENT,
  type SearchHistoryItem
} from "../lib/searchHistory";

export default function SearchHistoryPanel() {
  const router = useRouter();
  const [items, setItems] = useState<SearchHistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function sync() {
      setItems(readSearchHistory());
      setLoaded(true);
    }

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(SEARCH_HISTORY_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SEARCH_HISTORY_EVENT, sync);
    };
  }, []);

  if (!loaded || !items.length) return null;

  function runSearch(query: string) {
    announceSearchQuery(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  function remove(query: string) {
    if (!removeSearchHistory(query)) {
      notify({
        tone: "error",
        title: "Could not update search history",
        message: "Browser storage is unavailable."
      });
    }
  }

  function clear() {
    if (!clearSearchHistory()) {
      notify({
        tone: "error",
        title: "Could not clear search history",
        message: "Browser storage is unavailable."
      });
      return;
    }

    notify({
      tone: "success",
      title: "Search history cleared",
      message: "Your device-local recent searches were cleared."
    });
  }

  return (
    <section className="search-history-panel panel" aria-label="Recent searches">
      <div className="search-history-heading">
        <div>
          <p className="eyebrow">On this device</p>
          <h2>Recent searches</h2>
          <p>Only searches you explicitly run are saved here.</p>
        </div>
        <button
          type="button"
          className="search-history-clear"
          onClick={clear}
        >
          Clear all
        </button>
      </div>

      <div className="search-history-list">
        {items.map((item) => (
          <div className="search-history-row" key={item.query.toLocaleLowerCase()}>
            <button
              type="button"
              className="search-history-run"
              onClick={() => runSearch(item.query)}
            >
              <span aria-hidden="true">⌕</span>
              <strong>{item.query}</strong>
            </button>
            <button
              type="button"
              className="search-history-remove"
              aria-label={`Remove ${item.query} from search history`}
              onClick={() => remove(item.query)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
