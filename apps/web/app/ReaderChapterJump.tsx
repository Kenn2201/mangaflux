"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

type Chapter = {
  id: string;
  title: string;
  chapter?: string;
};

export default function ReaderChapterJump({
  mangaId,
  currentChapter,
  querySuffix
}: {
  mangaId: string;
  currentChapter?: string;
  querySuffix: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [chapter, setChapter] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add("reader-jump-open");
    window.setTimeout(() => inputRef.current?.focus(), 0);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("reader-jump-open");
      previous?.focus?.();
    };
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const value = chapter.trim();
    if (!/^[0-9]+(?:\.[0-9]+)?$/.test(value)) {
      setMessage("Enter a chapter number such as 20 or 20.5.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/manga/${encodeURIComponent(
          mangaId
        )}/chapters?language=en&limit=100&offset=0&order=desc&chapter=${encodeURIComponent(
          value
        )}`,
        { cache: "no-store" }
      );

      const payload = (await response.json().catch(() => null)) as
        | { items?: Chapter[]; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Chapter lookup failed.");
      }

      const exact =
        payload?.items?.find((item) => item.chapter === value) ??
        payload?.items?.[0];

      if (!exact) {
        setMessage(`Chapter ${value} was not found in the English feed.`);
        return;
      }

      setOpen(false);
      router.push(`/read/${exact.id}${querySuffix}`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Chapter lookup failed."
      );
    } finally {
      setBusy(false);
    }
  }

  const layer =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="reader-jump-layer">
            <button
              type="button"
              className="reader-jump-backdrop"
              aria-label="Close chapter jump"
              onClick={() => setOpen(false)}
            />

            <section
              className="reader-jump-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reader-jump-title"
            >
              <p className="eyebrow">Reader navigation</p>
              <h2 id="reader-jump-title">Jump to chapter</h2>
              <p>
                {currentChapter
                  ? `You are on chapter ${currentChapter}. Enter another chapter number.`
                  : "Enter a chapter number to jump directly there."}
              </p>

              <form onSubmit={submit}>
                <input
                  ref={inputRef}
                  value={chapter}
                  inputMode="decimal"
                  placeholder="e.g. 20"
                  aria-label="Chapter number"
                  onChange={(event) => setChapter(event.target.value)}
                />
                <button type="submit" disabled={busy}>
                  {busy ? "Finding…" : "Go"}
                </button>
              </form>

              {message ? <span className="reader-jump-message">{message}</span> : null}

              <button
                type="button"
                className="reader-jump-cancel"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </section>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        className="reader-jump-trigger"
        type="button"
        onClick={() => {
          setChapter("");
          setMessage("");
          setOpen(true);
        }}
      >
        Jump chapter
      </button>
      {layer}
    </>
  );
}
