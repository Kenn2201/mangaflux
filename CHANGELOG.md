# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- Reader and library polish
- Large-series chapter pagination
- Language preferences
- Source health and production monitoring

## 0.6.0 - 2026-09-24 — Mobile UX Foundation

### Added
- Sticky responsive MangaFlux app header.
- iPhone-safe mobile bottom navigation for Home, Search, Library, and Account.
- Shared desktop/mobile site footer outside reader mode.
- Reusable skeleton system for account, library, search, manga details, and reader loading states.
- Global success/error/info toast system.
- Anime.js micro-interactions for route and toast entrances.
- Redesigned account profile with avatar, library statistics, Continue Reading, and security controls.
- Reduced-motion support.

### Improved
- Account session resolution now displays a skeleton instead of briefly flashing the signed-out form.
- Auth success/error actions now provide clear animated feedback.
- Email verification, password recovery, reset, sign-in/out, and bookmark actions have richer status feedback.
- Mobile touch targets, spacing, card sizing, navigation, and typography.
- Safari/iOS autofill styling no longer breaks the dark input design.
- Search now displays manga-card skeletons during requests.
- Library and reader startup states avoid abrupt layout shifts.

### Dependency
- Added Anime.js 4.5.0 for lightweight UI motion.

## 0.5.1 - 2026-09-24 — Transactional Email

- Resend email verification and password recovery.
- Hashed one-time email tokens and branded email templates.

## 0.5.0 - 2026-09-24 — Authentication
## 0.4.0 - 2026-09-24 — Neon Persistence
## 0.3.0 - 2026-09-24 — Reader UX
## 0.2.1 - 2026-09-24 — Security Patch
## 0.2.0 - 2026-09-24 — Security Preview
## 0.1.0 - 2026-09-24 — Reader Prototype
