# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- All-chapter pagination and chapter navigation at scale
- Tap-to-show reader controls
- Community comments/reactions and profile avatars
- Personalized recommendations

## 0.7.0 - 2026-09-24 — Discovery & Dashboard

### Added
- Dedicated public MangaFlux landing page.
- Dedicated signed-in Dashboard.
- Header search with debounced live suggestions, covers, year, and tag context.
- Keyboard navigation for search suggestions.
- Dedicated search-results page.
- Header genre browser with mobile bottom-sheet behavior.
- MangaFlux Hot discovery ranking blending recent updates and popularity.
- Popular, Top Rated, and Latest Updates discovery rails.
- Genre discovery shelf.
- Paginated Show All browse pages.
- Public discovery API and genre API with short-lived caching.

### Changed
- Search is now a first-class header interaction instead of a homepage-only form.
- Mobile bottom navigation now routes Browse and Library to dedicated product surfaces.
- Old `/?q=` search URLs redirect into the new search page.
- Search result summaries now include year/tag metadata when available.

### Security / reliability
- Discovery endpoints have a dedicated per-IP rate limit.
- Discovery query kinds, pagination values, and genre UUIDs are validated.
- MangaDex requests remain paced and cached.

## 0.6.0 - 2026-09-24 — Mobile UX Foundation
## 0.5.1 - 2026-09-24 — Transactional Email
## 0.5.0 - 2026-09-24 — Authentication
## 0.4.0 - 2026-09-24 — Neon Persistence
## 0.3.0 - 2026-09-24 — Reader UX
## 0.2.1 - 2026-09-24 — Security Patch
## 0.2.0 - 2026-09-24 — Security Preview
## 0.1.0 - 2026-09-24 — Reader Prototype
