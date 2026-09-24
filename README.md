# MangaFlux

> A mobile-first modular manga discovery, reading, community, recommendation, and reliability-focused platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.8.0--Reliability_Source_Health-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.8.0 — Reliability & Source Health**

MangaFlux now exposes live operational status and retries safe read-only requests when transient upstream failures occur.

### Source and service health

- public `/status` page
- MangaDex connectivity probe with latency
- Neon persistence probe with latency
- API/auth/email configuration state
- compact system-status link in the site footer
- source probes are cached briefly to avoid adding unnecessary MangaDex traffic
- the existing lightweight `/health` endpoint remains available for Render/cron wake checks

### Resilience

- shared browser-side GET retry helper
- bounded retry handling for transient 408/425/429/5xx failures
- honors bounded `Retry-After` values
- per-attempt timeouts
- abort-aware requests so search/navigation cancellation still works
- discovery, search, genres, and recommendation reads use the reliability helper
- degraded discovery/search states link directly to the status page

### Graceful degradation

MangaFlux treats account persistence and MangaDex source availability as separate components. A source outage should not be presented as if the user's account data is also lost, and a persistence outage should not imply MangaDex itself is unavailable.

## Completed product phases

~~~text
v0.6.x  Mobile UX Foundation
v0.7.x  Product Experience
v0.8.0  Reliability & Source Health
~~~

## Next

The remaining **v0.8.x** work focuses on operational diagnostics, optional production monitoring, cache/rate-limit review, and performance hardening.

Then:

~~~text
v0.9.x  V1 Release Candidate
v1.0.0  Stable V1
~~~
