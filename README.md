# MangaFlux

> A mobile-first modular manga discovery, reading, community, recommendation, and reliability-focused platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.9.0--V1_Release_Candidate-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.9.0 — V1 Release Candidate**

MangaFlux has entered stabilization. v0.9 is intentionally focused on release quality rather than another major feature set.

### Release-candidate hardening

- synchronized-version/release-invariant CI check
- browser-facing security-header baseline
- Next.js framework signature header disabled
- private account/dashboard/admin pages marked noindex
- robots rules exclude API/private product surfaces
- global not-found and recoverable route-error experiences
- keyboard skip links
- mobile navigation exposes current-page state
- autocomplete upgraded to combobox/listbox semantics
- genre browser upgraded to modal-dialog semantics with focus return
- hidden reader chrome becomes inert to keyboard interaction
- dedicated V1 production test checklist

### Automated release invariants

CI now verifies:

- all workspace versions match
- API version matches package version
- MangaDex User-Agent matches release version
- admin email is not hardcoded in the Render blueprint
- known secrets are never renamed into NEXT_PUBLIC variables
- private API routes do not use MangaFlux public-proxy cache helpers
- required frontend security headers remain configured

The existing secret scan, migration validation, TypeScript checks, production build, and dependency audit still run on every release PR.

### Manual release gate

CI cannot replace real device QA. The canonical production checklist is:

`docs/V1-RELEASE-CHECKLIST.md`

v1.0.0 should be tagged only after the v0.9 production checklist is completed and blocking findings are resolved.

## Completed phases

~~~text
v0.6.x  Mobile UX Foundation
v0.7.x  Product Experience
v0.8.x  Reliability + Operations
v0.9.0  V1 Release Candidate
~~~

Next: resolve any v0.9 physical/regression findings, then prepare **v1.0.0 Stable V1**.
