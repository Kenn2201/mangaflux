# MangaFlux

> A mobile-first manga discovery, reading, community, recommendation, and account platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v1.1.0--Library_Reader_Settings-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v1.1.0 — Library & Reader Settings Foundation**

MangaFlux V1 remains a stable single-source MangaDex product. v1.1 starts the Library & Reading Quality phase without changing the source architecture.

### Library improvements

- Library filter/search by title
- switch between All / Bookmarks / History
- sort by recent activity, title, or reading progress
- larger account/device library summaries for real library browsing
- remove one manga from reading history
- clear reading history while preserving bookmarks
- destructive history actions require confirmation

### Reader settings

Each manga can now keep browser-local per-series reader preferences:

- preferred chapter language
- Data Saver
- whether alternate scanlation releases are shown

The settings sheet is available from manga chapter lists and inside the immersive reader.

### Chapter quality

- chapter lists respect the selected language
- direct chapter jump respects the selected language
- previous/next reader navigation respects the selected language
- duplicate chapter-number releases are collapsed by default
- scanlation group attribution remains visible
- an alternate-release count is shown when duplicates are collapsed
- readers can opt back into all alternate releases

### Architecture boundary

V1 remains MangaDex-only. MangaFlux does not bypass anti-bot protections, CAPTCHAs, paywalls, or login walls, and does not mirror manga page binaries into MangaFlux persistence.

## Branch workflow

Development now uses one persistent working branch:

~~~text
main
└── kenn/develop
~~~

New MangaFlux work should use `kenn/develop`, pass CI in a PR, merge to `main`, then reset `kenn/develop` to the new `main` head for the next task. Do not create a new `kenn/*` branch for every version.

See `docs/ROADMAP.md` for the canonical 1.x / 2.x / 3.x roadmap.
