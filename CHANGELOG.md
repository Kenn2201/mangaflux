# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- Session management polish
- Large-series chapter pagination
- Final V1 production and mobile QA

## 0.5.1 - 2026-09-24 — Transactional Email

### Added
- Resend transactional-email integration using `MangaFlux <noreply@manga.kenncode.me>`.
- Branded responsive HTML + plain-text verification emails.
- Branded responsive HTML + plain-text password-reset emails.
- Email verification with hashed 24-hour one-time tokens.
- Password recovery with hashed 30-minute one-time reset tokens.
- Forgot-password, verification-result, and reset-password account screens.
- Resend-verification controls in the account UI.
- Email delivery status in the API health response.

### Security
- Resend API key remains Render-only.
- Verification/reset tokens are generated from secure random bytes and only hashes are stored in Neon.
- Password reset invalidates all existing account sessions.
- Password reset also proves email possession and marks the email verified.
- Password-recovery requests use generic responses to reduce account enumeration.
- Email endpoints have a dedicated rate limit.

### Changed
- New accounts must verify their email before the first login.
- Existing sessions remain valid during this pre-1.0 migration, while future logins require verification.

## 0.5.0 - 2026-09-24 — Authentication

### Added
- Email/password account signup/login/logout.
- Salted scrypt passwords and opaque HttpOnly account sessions.
- Account-backed bookmarks/progress/history and device-state import.

## 0.4.0 - 2026-09-24 — Neon Persistence

### Added
- Neon/Drizzle persistence, bookmarks, reading progress/history, Continue Reading, and device state.

## 0.3.0 - 2026-09-24 — Reader UX

### Added
- Search restoration, Page X / Y, reader progress, chapter navigation, and data saver.

## 0.2.1 - 2026-09-24 — Security Patch
## 0.2.0 - 2026-09-24 — Security Preview
## 0.1.0 - 2026-09-24 — Reader Prototype
