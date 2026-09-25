"use client";

import {
  useEffect,
  useState
} from "react";
import { createPortal } from "react-dom";
import {
  clearSeriesReaderPreferences,
  getReaderPreferences,
  readerLanguageOptions,
  saveReaderPreferences,
  syncReaderPreferences,
  syncSavedReaderPreferences,
  type ReaderPreferences
} from "../lib/readerPreferences";

export default function ReaderSettingsSheet({
  mangaId,
  open,
  onClose,
  onChange,
  scanlationGroups = []
}: {
  mangaId: string;
  open: boolean;
  onClose: () => void;
  onChange?: (preferences: ReaderPreferences) => void;
  scanlationGroups?: string[];
}) {
  const [preferences, setPreferences] = useState<ReaderPreferences>(() =>
    getReaderPreferences(mangaId)
  );

  useEffect(() => {
    if (!open) return;

    setPreferences(getReaderPreferences(mangaId));
    void syncReaderPreferences(mangaId).then((next) => {
      setPreferences(next);
      onChange?.(next);
    });
    const previous = document.activeElement as HTMLElement | null;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("reader-settings-open");

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("reader-settings-open");
      previous?.focus?.();
    };
  }, [open, mangaId]);

  if (!open || typeof document === "undefined") return null;

  function update(next: ReaderPreferences) {
    setPreferences(next);
    saveReaderPreferences(next, mangaId, "series");
    syncSavedReaderPreferences(mangaId);
    onChange?.(next);
  }

  return createPortal(
    <div className="reader-settings-layer">
      <button
        type="button"
        className="reader-settings-backdrop"
        aria-label="Close reader settings"
        onClick={onClose}
      />

      <section
        className="reader-settings-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reader-settings-title"
      >
        <div className="reader-settings-heading">
          <div>
            <p className="eyebrow">Per-series settings</p>
            <h2 id="reader-settings-title">Reader settings</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>

        <label className="reader-setting-row">
          <span>
            <strong>Chapter language</strong>
            <small>Used for chapter lists, jump, and next/previous navigation.</small>
          </span>
          <select
            value={preferences.language}
            onChange={(event) =>
              update({
                ...preferences,
                language: event.target.value
              })
            }
          >
            {readerLanguageOptions.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="reader-setting-row reader-setting-toggle">
          <span>
            <strong>Data Saver</strong>
            <small>Prefer smaller MangaDex page images.</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.dataSaver}
            onChange={(event) =>
              update({
                ...preferences,
                dataSaver: event.target.checked
              })
            }
          />
        </label>

        <label className="reader-setting-row">
          <span>
            <strong>Image fit</strong>
            <small>
              Fill the reader width or keep each page inside the current screen height.
            </small>
          </span>
          <select
            value={preferences.imageFit}
            onChange={(event) =>
              update({
                ...preferences,
                imageFit: event.target.value as ReaderPreferences["imageFit"]
              })
            }
          >
            <option value="width">Fit width</option>
            <option value="screen">Fit screen</option>
          </select>
        </label>

        <label className="reader-setting-row">
          <span>
            <strong>Page spacing</strong>
            <small>
              Control the visual gap between consecutive manga pages.
            </small>
          </span>
          <select
            value={preferences.pageGap}
            onChange={(event) =>
              update({
                ...preferences,
                pageGap: event.target.value as ReaderPreferences["pageGap"]
              })
            }
          >
            <option value="none">Seamless</option>
            <option value="small">Small gap</option>
            <option value="large">Large gap</option>
          </select>
        </label>

        <label className="reader-setting-row">
          <span>
            <strong>Preferred scanlation group</strong>
            <small>
              When duplicate releases exist, MangaFlux prefers this group while keeping attribution visible.
            </small>
          </span>
          <select
            value={preferences.preferredScanlationGroup ?? ""}
            onChange={(event) =>
              update({
                ...preferences,
                preferredScanlationGroup:
                  event.target.value || undefined
              })
            }
          >
            <option value="">No preference</option>
            {Array.from(new Set(scanlationGroups))
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b))
              .map((group) => (
                <option value={group} key={group}>
                  {group}
                </option>
              ))}
          </select>
        </label>

        <label className="reader-setting-row reader-setting-toggle">
          <span>
            <strong>Alternate releases</strong>
            <small>Show multiple scanlation releases for the same chapter.</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.showAlternateReleases}
            onChange={(event) =>
              update({
                ...preferences,
                showAlternateReleases: event.target.checked
              })
            }
          />
        </label>

        <button
          className="reader-settings-reset"
          type="button"
          onClick={() => {
            clearSeriesReaderPreferences(mangaId);
            const next = getReaderPreferences();
            setPreferences(next);
            onChange?.(next);
          }}
        >
          Use global defaults
        </button>
      </section>
    </div>,
    document.body
  );
}
