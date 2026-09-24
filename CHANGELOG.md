# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Release-candidate work
- Remaining physical iPhone/tablet/desktop findings
- Accessibility findings and fixes
- Final production smoke-test findings
- Branch cleanup
- v1.0.0 release preparation

## 0.9.1 - 2026-09-24 — RC UX & Account Hardening

### Added
- Visible Browse filter bar for ranking, genre, status, and release year.
- Reader Jump Chapter dialog for direct chapter-number navigation.
- Public MangaFlux community profile endpoint and profile modal.
- Public community stats for comments and reactions.
- Recent public-comment activity links inside profile modal.
- Account-page public-profile preview.
- Admin View Profile action.
- Confirmation dialog component for destructive/session-changing actions.

### Changed
- Successful login now replaces the account's previous active session.
- Signing in on another device/browser remains allowed, but the newest login becomes the sole active session.
- Sign-in/create-account UI now explains sync, verification, community identity, and session behavior.
- Session row now explains the one-active-session rule.
- iPhone/mobile avatar normalization progressively reduces dimensions and WebP quality before failing.
- Local avatar source limit raised to 10 MB while the final uploaded WebP remains bounded.
- Browse filters preserve an active creator filter.

### Confirmations
- Sign out requires confirmation.
- Own-comment deletion requires confirmation.
- Password reset requires confirmation and explains session revocation.
- Admin comment removal requires confirmation.
- Admin user-session revocation requires confirmation.

### Privacy / security
- Public community profile data never includes account email.
- Existing comment/reaction authentication and cooldown rules are unchanged.
- Single-session replacement happens server-side during verified login.

## 0.9.0 - 2026-09-24 — V1 Release Candidate
## 0.8.3 - 2026-09-24 — Cache, Rate Limits & Performance Hardening
## 0.8.2 - 2026-09-24 — Diagnostics & Observability
## 0.8.1 - 2026-09-24 — Admin Operations
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
