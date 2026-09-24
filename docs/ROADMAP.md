# MangaFlux Roadmap

## v0.7.x — Product Experience — complete

- discovery/dashboard
- chapter scale/reader controls
- community/profiles
- recommendations

## v0.8.x — Reliability + Operations — complete

- source/database health
- retry/backoff and status UI
- admin operations
- runtime diagnostics
- bounded caching/rate limiting
- performance hardening

## v0.9.x — V1 release candidate — current

### v0.9.0 — Release Candidate Foundation
- feature freeze for major V1 scope
- accessibility semantics pass
- browser security headers
- noindex for private product surfaces
- global error/not-found UX
- synchronized release-invariant CI
- canonical production release checklist

### v0.9.1 — RC UX & Account Hardening
- Browse filtering UI
- reader chapter jump
- one active login session per account
- public community profile modal/stats/recent comments
- admin View Profile
- improved sign-in/profile presentation
- more resilient iPhone avatar compression
- confirmations for sign-out/delete/reset/admin destructive actions

### Remaining v0.9.x
- physical mobile/tablet/desktop findings
- VoiceOver/keyboard findings
- auth/email/session production verification
- cache/rate-limit production verification
- final dependency/migration/security audit
- repository/branch cleanup
- final production smoke test

## v1.0.0 — Stable V1 — next after RC passes

A stable mobile-first MangaDex reader with discovery, complete chapter navigation, verified accounts/recovery, account-backed library/progress, community, recommendations, operations visibility, accessibility, and production-grade reliability/security.
