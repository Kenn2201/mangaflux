# MangaFlux

> A mobile-first modular manga discovery, reading, community, recommendation, and reliability-focused platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.9.1--RC_UX_Account_Hardening-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.9.1 — RC UX & Account Hardening**

This release addresses findings from the first v0.9 physical audit without reopening the V1 feature scope.

### Discovery filtering

Browse now has visible filters for:

- ranking: Popular / Top Rated / Latest / MangaFlux Hot
- genre
- publication status
- release year
- existing creator filters remain preserved when applying the other filters

Filters reset pagination to page 1 and work with the existing server-validated discovery parameters.

### Reader chapter jump

The immersive reader now includes **Jump chapter** while reader controls are visible.

Readers can enter a chapter number such as `20` or `20.5` and jump directly to that chapter in the English MangaDex feed without returning to the full chapter list.

Previous / Chapters / Next navigation remains unchanged.

### One active account session

MangaFlux now keeps one active session per account during normal login.

You can still sign in from any phone, browser, or computer. A successful new login replaces the previous active session, so the older device/browser becomes signed out on its next authenticated request.

Password resets continue to revoke all sessions.

### Community profiles

Reader names and avatars in comments are now interactive.

The public profile modal exposes only community-safe information:

- display name
- avatar
- join month/year
- total public comments
- total reactions
- recent public comments with links back to their manga/chapter discussion

Account email is never returned by the public profile endpoint.

Admins also gain a safe **View profile** option next to session revocation.

### Account / profile UX

- refreshed sign-in/create-account presentation
- clearer explanation of account benefits and the one-active-session policy
- profile preview directly from Account
- stronger session-status copy
- iPhone avatar processing now progressively reduces WebP dimensions/quality before rejecting an image
- avatar source files up to 10 MB may be processed locally; the uploaded result remains small and bounded

### Confirmation UX

MangaFlux now asks for confirmation before:

- signing out
- deleting your own community comment
- resetting your password
- administrator comment removal
- administrator session revocation

## V1 release-candidate state

~~~text
v0.9.0  RC foundation / accessibility / release engineering
v0.9.1  RC UX & account hardening
~~~

Continue using `docs/V1-RELEASE-CHECKLIST.md` for production testing. Major new V1 scope remains frozen.
