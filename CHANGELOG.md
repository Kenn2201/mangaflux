# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- Community comments/reactions and profile avatars
- Personalized recommendations

## 0.7.1 - 2026-09-24 — Chapter Scale & Reader Controls

### Fixed
- Genre menu no longer repeatedly restarts its request while the loading state changes.
- Genre menu now exposes an explicit retry state instead of an indefinite spinner.

### Added
- Paginated MangaDex chapter feed with total/limit/offset metadata.
- Newest and Oldest chapter sorting.
- Exact chapter-number lookup.
- Reader previous/next lookup across paginated chapter feeds.
- Tap-to-show reader chrome.
- Auto-hide reader controls.
- Persistent Page X / Y HUD.
- Persistent reading progress meter.
- Reader overlay chapter navigation.
- Lower-right scroll-to-top control.

### Changed
- Manga chapter lists now display 50 items per page rather than silently exposing only the newest 100.
- Reader navigation can traverse series whose current chapter is outside the newest 100 feed items.
- Reader source/save/quality controls move into temporary chrome while page/progress indicators stay visible.

## 0.7.0 - 2026-09-24 — Discovery & Dashboard
## 0.6.0 - 2026-09-24 — Mobile UX Foundation
## 0.5.1 - 2026-09-24 — Transactional Email
## 0.5.0 - 2026-09-24 — Authentication
## 0.4.0 - 2026-09-24 — Neon Persistence
## 0.3.0 - 2026-09-24 — Reader UX
## 0.2.1 - 2026-09-24 — Security Patch
## 0.2.0 - 2026-09-24 — Security Preview
## 0.1.0 - 2026-09-24 — Reader Prototype
