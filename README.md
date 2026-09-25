# MangaFlux

> A mobile-first manga discovery, reading, community, recommendation, and account platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v1.1.2--Reader_Layout_Controls-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v1.1.2 — Reader Layout Controls**

MangaFlux V1 remains a stable single-source MangaDex product. v1.1.2 adds focused reader-layout controls while preserving the account-synced preference foundation from v1.1.1.

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

### v1.1.2 refinements

- Fit screen keeps each manga page inside the current viewport height while preserving vertical reading
- page-spacing controls let readers keep pages seamless or add small/large visual gaps
- the new layout preferences use the same timestamp-safe account synchronization as the existing per-series preferences
- existing accounts receive safe migration defaults: Fit width + Seamless
- the immersive reader's quick Data Saver control now uses the same persisted/synchronized preference path as Reader Settings

### Architecture boundary

V1 remains MangaDex-only. MangaFlux does not bypass anti-bot protections, CAPTCHAs, paywalls, or login walls, and does not mirror manga page binaries into MangaFlux persistence.

## Branch workflow

Incremental work should not be pushed repeatedly to the deployment-watched development branch.

~~~text
main
  ↓
temporary kenn/work-* branch
  ↓
complete implementation + fixes + docs
  ↓
one final PR to main
  ↓
CI gate
  ↓
main
  ↓
sync kenn/develop to the merged main head
~~~

Use temporary work branches for in-progress commits. Keep `kenn/develop` clean during implementation and avoid incremental pushes that cause unnecessary deployment churn.

See `docs/ROADMAP.md` for the canonical 1.x / 2.x / 3.x roadmap.
