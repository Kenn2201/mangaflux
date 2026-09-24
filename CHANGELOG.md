# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- Optional production monitoring
- Cache/revalidation and rate-limit review
- Performance and cold-start hardening

## 0.8.1 - 2026-09-24 — Admin Operations

### Added
- Server-side `ADMIN_EMAILS` administrator allowlist.
- `role: admin|user` in authenticated session responses.
- Protected `/admin` console.
- Operational counters for users, active sessions, comments, reactions, bookmarks, and reading progress.
- Recent-user and recent-community activity views.
- Administrator comment removal.
- Administrator session revocation for another user.
- Admin entry point on the account page.

### Security
- Admin authorization is enforced on the API after proxy-secret and bearer-session validation.
- Admin access requires a verified MangaFlux account whose email is in `ADMIN_EMAILS`.
- The console never returns password hashes, session tokens, API keys, or database credentials.
- Admin self-session bulk revocation is blocked from the console.
- Admin mutations keep the existing same-origin/client-header protection at the Vercel boundary.
- Personal admin email addresses are not hardcoded into the repository.

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
