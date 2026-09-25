# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### v1.1.1 — Preference Sync & Scanlation Controls
- safe account-sync behavior for per-series reader preferences
- browser-local preference fallback for resilience
- optional preferred scanlation-group behavior per series
- improved alternate-release/group selection controls
- focused history-management refinements from v1.1.0 testing
- tablet/landscape QA for Library, chapter controls, and Reader Settings

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

### Development workflow
- Standardized future ChatGPT-assisted development on a single persistent `kenn/develop` branch.

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
