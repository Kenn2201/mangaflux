# MangaFlux

> A mobile-first modular manga discovery, reading, community, recommendation, and reliability-focused platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.8.2--Diagnostics_Observability-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.8.2 — Diagnostics & Observability**

MangaFlux now has privacy-minimized runtime diagnostics inside the protected administrator console.

### Runtime diagnostics

The admin console now reports a rolling 15-minute view of:

- request count
- 4xx client errors
- 429 rate-limit responses
- 5xx server errors
- average request latency
- p95 request latency
- process RSS / heap usage
- API process uptime and Node version
- busiest normalized routes
- recent 429/5xx failures

Diagnostics are in-memory and intentionally do **not** collect:

- request bodies
- query strings
- IP addresses
- authorization headers
- account emails
- passwords
- session tokens
- API keys

The data resets when the Render process restarts, which is acceptable for this lightweight pre-V1 operational view.

### Admin configuration diagnostics

Public system status now reports whether the API-side admin allowlist is **configured** or **disabled** without exposing the configured email addresses.

Administrator access still comes only from the Render API service environment:

~~~text
ADMIN_EMAILS=your-verified-account@example.com
~~~

Putting `ADMIN_EMAILS` only in Vercel does not make an account an administrator because authorization is evaluated by the Render/Fastify backend.

### Reliability phase

~~~text
v0.8.0  Reliability & Source Health
v0.8.1  Admin Operations
v0.8.2  Diagnostics & Observability
~~~

Next: cache/revalidation, rate-limit, and performance/cold-start hardening before the v0.9 release-candidate phase.
