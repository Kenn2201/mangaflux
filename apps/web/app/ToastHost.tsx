"use client";

import { animate } from "animejs";
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import type {
  ToastPayload,
  ToastTone
} from "../lib/toast";

type ToastItem = {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
};

export default function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }

    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    function onToast(event: Event) {
      const detail = (event as CustomEvent<ToastPayload>).detail;
      if (!detail?.title) return;

      const id = crypto.randomUUID();
      const item: ToastItem = {
        id,
        title: detail.title,
        message: detail.message,
        tone: detail.tone ?? "info"
      };

      setItems((current) => [...current.slice(-2), item]);

      const timer = window.setTimeout(() => dismiss(id), 4200);
      timers.current.set(id, timer);
    }

    window.addEventListener("mangaflux:toast", onToast);

    return () => {
      window.removeEventListener("mangaflux:toast", onToast);
      for (const timer of timers.current.values()) {
        window.clearTimeout(timer);
      }
      timers.current.clear();
    };
  }, [dismiss]);

  useEffect(() => {
    const newest = items.at(-1);
    if (!newest) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const node = document.querySelector<HTMLElement>(
      `[data-toast-id="${newest.id}"]`
    );

    if (!node) return;

    animate(node, {
      opacity: { from: 0 },
      y: { from: 14 },
      duration: 360,
      ease: "outQuad"
    });
  }, [items]);

  return (
    <div className="toast-region" aria-live="polite" aria-atomic="false">
      {items.map((item) => (
        <div
          className={`toast toast-${item.tone}`}
          data-toast-id={item.id}
          key={item.id}
          role="status"
        >
          <span className="toast-icon" aria-hidden="true">
            {item.tone === "success"
              ? "✓"
              : item.tone === "error"
                ? "!"
                : "i"}
          </span>

          <div className="toast-copy">
            <strong>{item.title}</strong>
            {item.message ? <span>{item.message}</span> : null}
          </div>

          <button
            type="button"
            className="toast-close"
            aria-label="Dismiss notification"
            onClick={() => dismiss(item.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
