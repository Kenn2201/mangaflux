# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- v1.1.3+ remaining reading-quality work
- additional history-management controls
- reader typography refinements if real usage justifies them
- broader accessibility/regression polish and final v1.1.x QA

## 1.1.2 - 2026-09-25 — Reader Layout Controls

### Reader layout
- Added per-series image-fit controls with Fit width and Fit screen modes.
- Added Seamless, Small gap, and Large gap page-spacing options.
- Fit screen constrains manga pages to the current viewport height while preserving vertical reading.

### Preference persistence
- Extended account-synced reader preferences with image-fit and page-spacing values.
- Added safe migration defaults for existing preference rows.
- Kept browser-local fallback and timestamp conflict protection.
- Routed the immersive reader's quick Data Saver toggle through the same persisted/synchronized preference path.

### Development workflow
- Keep MangaFlux development on the persistent `kenn/develop` branch.
- Do not create temporary version/work branches for normal release work.
- Open one complete release PR from `kenn/develop` to `main`, merge only after CI passes, then reset `kenn/develop` to the merged `main` head.

## 1.1.1 - 2026-09-25 — Reading Quality Refinements

### Preference synchronization
- Added signed-in per-series reader preference synchronization.
- Kept browser-local preferences as the signed-out/offline fallback.
- Added timestamp conflict resolution so older device state cannot overwrite a newer preference choice.
- Added a dedicated persistence migration for account-backed reader preferences.

### Scanlation controls
- Added an optional preferred scanlation group per manga.
- Duplicate chapter releases now prefer the selected group when it is present.
- Scanlation attribution remains visible and all alternate releases can still be shown.

### Responsive QA
- Hardened Reader Settings for short landscape viewports.
- Kept broader typography, spacing, reader-fit, history, and accessibility work in v1.1.2+.

## 1.1.0 - 2026-09-25 — Library & Reader Settings Foundation

### Library
- Added All / Bookmarks / History library views.
- Added title filtering.
- Added recent/title/progress sorting.
- Expanded persisted summary retrieval from 12 to 100 bookmark/history records.
- Added remove-one reading-history action.
- Added clear-history action while preserving bookmarks.
- Added confirmation UX around history deletion.

### Reader settings
- Added a per-series reader settings sheet.
- Added preferred chapter language.
- Added per-series Data Saver preference.
- Added alternate-release visibility preference.
- Settings are browser-local in the v1.1.0 foundation and can fall back to global defaults.

### Chapters
- Manga chapter list uses preferred language.
- Reader previous/next chapter lookup uses preferred language.
- Jump Chapter uses preferred language.
- Duplicate releases for the same chapter number collapse by default.
- Scanlation group remains visible.
- Collapsed rows show the number of alternate releases.
- Readers can enable all alternate releases.

### Responsive UX
- Added dedicated tablet/mobile layouts for library controls, history actions, reader settings, and chapter controls.

## 1.0.0 - 2026-09-24 — Stable V1
## 0.9.1 - 2026-09-24 — RC UX & Account Hardening
## 0.9.0 - 2026-09-24 — V1 Release Candidate
## 0.8.3 - 2026-09-24 — Cache, Rate Limits & Performance Hardening
## 0.8.2 - 2026-09-24 — Diagnostics & Observability
## 0.8.1 - 2026-09-24 — Admin Operations
## 0.8.0 - 2026-09-24 — Reliability & Source Health
## 0.7.3 - 2026-09-24 — Recommendations
## 0.7.2 - 2026-09-24 — Community & Profiles
## 0.7.1 - 2026-09-24 — Chapter Scale & Reader Controls
## 0.7.0 - 2026-09-24 — Discovery & Dashboard
## 0.6.0 - 2026-09-24 — Mobile UX Foundation
## 0.5.1 - 2026-09-24 — Transactional Email
## 0.5.0 - 2026-09-24 — Authentication
## 0.4.0 - 2026-09-24 — Neon Persistence
## 0.3.0 - 2026-09-24 — Reader UX
## 0.2.1 - 2026-09-24 — Security Patch
## 0.2.0 - 2026-09-24 — Security Preview
## 0.1.0 - 2026-09-24 — Reader Prototype
