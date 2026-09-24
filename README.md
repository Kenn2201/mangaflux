# MangaFlux

> A mobile-first modular manga discovery, reading, community, and recommendation platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.7.3--Recommendations-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.7.3 — Recommendations**

This closes the v0.7 Product Experience phase.

### Recommendations

- **Related titles** from explicit MangaDex title relations when available.
- **More like this** on manga pages.
- **Because you read…** on the signed-in dashboard.
- recommendation ranking combines lightweight metadata signals rather than AI:
  - creator
  - genre
  - theme
  - release year
  - recent MangaFlux reading/library seed
- already-read/bookmarked titles are excluded from personalized dashboard suggestions.

### Discovery polish

- publication status on manga details is clickable.
- release year on manga details is clickable.
- authors and artists are clickable.
- creator browsing uses the creator's MangaDex relationship ID.
- year browsing filters discovery by release year.
- manga tags/genres remain clickable.

MangaFlux intentionally keeps this recommendation system explainable and inexpensive for V1. Semantic/embedding recommendations remain a later v3+ idea.

## Completed v0.7 Product Experience

~~~text
v0.7.0  Discovery & Dashboard
v0.7.1  Chapter Scale & Reader Controls
v0.7.2  Community & Profiles
v0.7.3  Recommendations
~~~

## Next

**v0.8.x — Reliability + Source Health**

The next phase focuses on downstream health, retries, diagnostics, monitoring, caching/rate-limit hardening, and production reliability before the v0.9 release-candidate audit.
