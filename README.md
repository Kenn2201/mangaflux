# MangaFlux

> A mobile-first manga discovery, reading, community, recommendation, and account platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v1.0.0--Stable_V1-emerald.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v1.0.0 — Stable V1**

MangaFlux V1 is the stable production baseline after the v0.9 release-candidate cycle.

### Stable V1 includes

- mobile-first landing, dashboard, discovery, autocomplete, genres, and filters
- MangaDex-backed manga details, recommendations, and source attribution
- scalable 300+ chapter pagination/sorting/direct lookup
- immersive reader with progress, Page X / Y, Data Saver, reader HUD, previous/next, chapter home, scroll-to-top, and Jump Chapter
- verified email/password accounts with recovery and one active session per account
- account-backed bookmarks, reading history, progress, and Continue Reading
- community profiles, avatars, reactions, comments, cooldowns, and public profile activity
- protected admin operations with comment removal, session revocation, profiles, health, and diagnostics
- source/database health, retry/backoff, bounded caching/rate limits, and privacy-minimized runtime diagnostics
- release invariants, security headers, accessibility semantics, failure UX, and production CI gates

### V1 architecture boundary

V1 remains a **single-source MangaDex reader**. MangaFlux does not bypass anti-bot protections, CAPTCHAs, paywalls, or login walls and does not mirror manga page binaries into its database/object storage.

## What comes next

See `docs/ROADMAP.md` for the 1.x, 2.x, and 3.x roadmap.

- **1.x:** deepen the stable MangaDex product without changing the source architecture.
- **2.x:** permitted multi-source architecture and normalized source federation.
- **3.x:** semantic discovery, richer personalization, native/PWA clients, and broader platform features.
