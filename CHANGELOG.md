# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- Email verification / account recovery strategy
- Session management polish
- Large-series chapter pagination
- Final V1 production and mobile QA

## 0.5.0 - 2026-09-24 — Authentication

### Added
- Email/password account signup and login.
- Password hashing with Node scrypt and per-password random salts.
- Opaque random session tokens stored only as SHA-256 hashes in Neon.
- HttpOnly secure account session cookie on the MangaFlux web origin.
- Server-to-server Vercel → Render auth proxy secret.
- Authenticated account bookmarks, history, reading progress, and Continue Reading.
- One-time import of device-scoped bookmarks/progress into each account.
- Account page, session status chip, and sign-out flow.
- Separate auth signup/login/session rate limits.

### Security
- Passwords are never stored directly.
- Raw session tokens are not stored in Neon and are not returned to browser JavaScript.
- Direct Render auth/account endpoints require the internal proxy secret in addition to account session tokens.
- State-changing web auth routes require same-origin requests plus a custom anti-CSRF header.
- Login errors do not reveal whether an email or password was incorrect.
- Account routes keep database/auth errors generic.

### Known pre-1.0 limitation
- Email verification and password recovery are not implemented yet. This must be addressed before treating MangaFlux accounts as production-complete.

## 0.4.0 - 2026-09-24 — Neon Persistence

### Added
- Neon/Drizzle database client and checked-in runtime migrations.
- Device-scoped HttpOnly reader identity.
- Neon-backed bookmarks, reading progress/history, Continue Reading, and page resume.
- Migration journal verification in CI.

## 0.3.0 - 2026-09-24 — Reader UX

### Added
- URL-backed search restoration.
- Page X / Y tracking and live progress.
- Previous/next chapter navigation.
- Persistent data-saver preference.

## 0.2.1 - 2026-09-24 — Security Patch

### Security
- Removed unused browser runtime.
- Audited the full dependency tree.

## 0.2.0 - 2026-09-24 — Security Preview

### Security
- Added rate limits, input validation, source hardening, secure headers, CI secret scanning, and Dependabot.

## 0.1.0 - 2026-09-24 — Reader Prototype

### Added
- Next.js frontend, Fastify API, MangaDex adapter, deployments, and initial vertical reader.
