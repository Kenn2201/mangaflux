# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Release-candidate work
- Physical iPhone/tablet/desktop regression results
- Accessibility findings and fixes
- Final production smoke-test findings
- Branch cleanup
- v1.0.0 release preparation

## 0.9.0 - 2026-09-24 — V1 Release Candidate

### Added
- CI release-invariant validation.
- Canonical V1 production release checklist.
- Frontend security-header configuration.
- Keyboard skip-to-content links.
- Global not-found page.
- Recoverable global route-error page.
- robots policy for API/private account surfaces.

### Accessibility
- Mobile navigation now exposes `aria-current` on active destinations.
- Header search now uses combobox/listbox semantics with active option IDs.
- Genre browser now exposes modal-dialog semantics.
- Genre dialog moves focus to the close control and returns focus to its trigger.
- Reader root is a main landmark.
- Hidden top/bottom reader chrome is inert to keyboard interaction.

### Security / release engineering
- Next.js `X-Powered-By` is disabled.
- Frontend emits nosniff, DENY framing, referrer, permissions, and DNS-prefetch policy headers.
- Account, dashboard, and admin metadata are noindex/no-follow.
- CI rejects synchronized-version drift.
- CI rejects known private secrets renamed under `NEXT_PUBLIC_*`.
- CI rejects public cache helpers in known private API route families.
- CI verifies ADMIN_EMAILS is not hardcoded in render.yaml.

### Scope
- No major new MangaFlux feature was added in this release.
- v0.9 is a stabilization/release-candidate milestone; manual production QA is still required before v1.0.0.

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
