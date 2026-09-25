# MangaFlux

> A mobile-first manga discovery, reading, community, recommendation, and account platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v1.4.4--Search_History_Controls-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v1.4.4 — Search History Controls**

MangaFlux V1 remains a stable single-source MangaDex product. After v1.4.3 Recently Viewed Controls passed physical QA, v1.4.4 adds device-local recent searches with explicit controls while keeping autocomplete typing transient.

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

### v1.4.4 refinements

- v1.4.3 Recently Viewed Controls passed physical QA and is signed off
- up to 10 unique explicit search terms are remembered on the current device
- submitting a search, choosing a search suggestion, or revisiting a results query moves that term to the front
- autocomplete keystrokes alone are not written to search history
- recent searches appear when the header search is focused while empty
- the empty Search page exposes recent-search rerun, remove-one, and clear-all controls
- search history remains separate from Recently viewed, reading history, bookmarks, and account data
- no new database migration is required

### Architecture boundary

V1 remains MangaDex-only. MangaFlux does not bypass anti-bot protections, CAPTCHAs, paywalls, or login walls, and does not mirror manga page binaries into MangaFlux persistence.

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
