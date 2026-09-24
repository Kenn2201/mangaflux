# MangaFlux

> A mobile-first modular manga discovery, reading, community, recommendation, and reliability-focused platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.8.3--Cache_Performance_Hardening-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.8.3 — Cache, Rate Limits & Performance Hardening**

This release finishes the core v0.8 reliability work before the v0.9 release-candidate audit.

### MangaDex request efficiency

- duplicate identical in-flight MangaDex GETs are coalesced into one upstream request
- source caches are bounded instead of growing without limit
- expired/old entries are evicted
- admin diagnostics now expose cache hits, cache entry count, and coalesced-request count
- existing MangaDex pacing remains in place

### Public response caching

Public non-account data now has explicit shared-cache policy:

- search: 30 seconds
- discovery/home: 60 seconds
- chapter lists: 60 seconds
- manga details: 5 minutes
- related titles: 5 minutes
- genres/tags: 6 hours

Responses include `s-maxage` and `stale-while-revalidate` where appropriate, and the Vercel proxy preserves trusted public cache headers from the API. Error responses remain `no-store`.

Private/authenticated account, community-write, admin, and state responses are not moved into public caching.

### Rate-limit hardening

- in-memory rate-limit bucket storage is bounded
- expired buckets continue to be cleaned automatically
- responses now include a `RateLimit-Policy` header in addition to limit/remaining/reset information
- the current in-memory limiter remains appropriate for the single Render API instance
- a shared Redis/edge limiter remains deferred until horizontal scaling actually exists

### Runtime model

MangaFlux still uses the lightweight `/health` endpoint for Render/cron wake checks. Deeper source/database probes stay under `/api/status`, avoiding expensive dependency checks on every wake request.

## v0.8 reliability phase

~~~text
v0.8.0  Reliability & Source Health
v0.8.1  Admin Operations
v0.8.2  Diagnostics & Observability
v0.8.3  Cache, Rate Limits & Performance Hardening
~~~

Next: **v0.9.x — V1 Release Candidate**, focused on regression testing, accessibility, security review, repository cleanup, and production release QA.
