# MangaFlux

> A mobile-first manga discovery, reading, community, recommendation, and account platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v1.5.0--Product_Polish-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v1.5.0 — Product Polish**

MangaFlux V1 remains a stable single-source MangaDex product. v1.4.7 and the full v1.4.x Discovery & Personalization phase passed physical QA. v1.5.0 consolidates the complete planned Product Polish scope into one final V1 QA target: installability, offline-safe fallback, faster shell states, accessibility, performance, and production hardening.

### Library improvements

- Library filter/search by title
- switch between All / Bookmarks / History
- sort by recent activity, title, or reading progress
- larger account/device library summaries for real library browsing
- remove one manga from reading history
- clear reading history while preserving bookmarks
- destructive history actions require confirmation

### Reader settings

Each manga can keep per-series reader preferences with signed-in account synchronization and browser-local fallback:

- preferred chapter language
- Data Saver
- preferred scanlation group
- whether alternate scanlation releases are shown
- image fit: Fit width or Fit screen
- page spacing: Seamless, Small gap, or Large gap
- reader UI text size: Small, Standard, or Large

The settings sheet is available from manga chapter lists and inside the immersive reader.

### Chapter quality

- chapter lists respect the selected language
- direct chapter jump respects the selected language
- previous/next reader navigation respects the selected language
- duplicate chapter-number releases are collapsed by default
- collapsed duplicates prefer the selected scanlation group when available
- scanlation group attribution remains visible
- an alternate-release count is shown when duplicates are collapsed
- readers can opt back into all alternate releases

### v1.5.0 refinements

- v1.4.7 and the full v1.4.x phase passed physical QA and are signed off
- add an installable web-app manifest with MangaFlux icons and standalone metadata
- add a conservative service worker that caches only the offline fallback and same-origin static shell assets
- never cache authenticated API/state traffic or reader chapter traffic in the service worker
- add a dedicated offline fallback and live offline-status announcement
- add route-level loading, error recovery, and not-found states
- move keyboard focus to new route content for clearer navigation
- add content-visibility containment to defer off-screen rendering work
- add explicit service-worker/offline/icon cache policies
- retain existing reduced-motion, focus-visible, security-header, diagnostics, and bounded rate-limit protections
- shared Redis/edge rate limiting remains intentionally deferred until MangaFlux runs multiple API instances or real traffic proves the need
- no new database migration is required

## Branch workflow

MangaFlux uses one persistent development branch and does not create temporary version/work branches.

~~~text
main
  ↓
kenn/develop
  ↓
complete implementation + fixes + docs
  ↓
one PR to main
  ↓
CI gate
  ↓
main
  ↓
reset kenn/develop to the merged main head
~~~

Keep all release work on `kenn/develop`. Consolidate the release there, open one complete PR to `main`, merge only after CI passes, then reset `kenn/develop` to the merged `main` head.

See `docs/ROADMAP.md` for the canonical 1.x / 2.x / 3.x roadmap.
