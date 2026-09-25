# MangaFlux

> A mobile-first manga discovery, reading, community, recommendation, and account platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v1.1.5--Reader_Navigation_Resume_Fixes-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v1.1.5 — Reader Navigation & Resume Fixes**

MangaFlux V1 remains a stable single-source MangaDex product. v1.1.5 applies the final reader-navigation and resume fixes discovered during physical QA without changing the source architecture.

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

### v1.1.5 refinements

- Continue Reading now holds the saved page while earlier lazy-loaded images settle instead of drifting to a later page
- pages through the resume target are loaded eagerly, normal page observation is paused during resume, and progress saving resumes only after the target is anchored
- Jump Chapter is now a scrollable chapter list with the current chapter highlighted as Reading now
- the chapter list loads toward the current position and continues loading older chapters as you scroll
- the reader Back control now offers Library, Discover more, and a similarity-based Surprise me roulette action
- the reader Home icon explicitly opens the current manga page
- common interactive controls now provide a small visual press response while respecting reduced-motion preferences

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
