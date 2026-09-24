# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- Personalized recommendations
- Reliability/source-health work

## 0.7.2 - 2026-09-24 — Community & Profiles

### Added
- MangaFlux-native manga comments.
- MangaFlux-native chapter comments.
- Manga/chapter reaction bar with Like, Funny, Wow, Sad, and Fire.
- Verified-account-only posting and reactions.
- Server-side one-comment-per-five-minutes cooldown.
- 1,000-character comment limit.
- Comment pagination.
- Own-comment deletion.
- Profile display names.
- Profile avatar upload with client-side square WebP normalization.
- Dedicated Genres & Themes directory.
- Browse More Genres action in the genre sheet.

### Fixed
- Mobile genre sheet now renders outside the sticky header via a portal.
- Scroll-to-top icon is optically centered using SVG.
- Reader mobile header now shows manga cover context.
- Reader bottom controls now include a centered Chapters/Home action.
- Manga tags/genres are now clickable discovery links.

### Security / privacy
- Community writes require authenticated, verified MangaFlux accounts.
- Comment cooldown is enforced server-side, not only in the UI.
- Public comments never expose account email.
- Avatar input is restricted to a bounded WebP data URL after local normalization.
- Community mutations remain behind the Vercel auth-proxy/CSRF boundary.

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
