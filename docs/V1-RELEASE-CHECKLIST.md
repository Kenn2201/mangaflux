# MangaFlux V1 Release Record

MangaFlux v1.0.0 was promoted from the v0.9 release-candidate series after the automated release gate passed and the blocking issues found during physical production testing were addressed.

## Automated release gate

- [x] secret scan
- [x] migration journal validation
- [x] release-invariant validation
- [x] TypeScript checks
- [x] production build
- [x] dependency audit

## Release-candidate fixes completed

- [x] mobile Genre sheet behavior
- [x] reader control alignment/navigation fixes
- [x] scalable 300+ chapter access
- [x] direct reader chapter jump
- [x] clickable metadata and Browse filters
- [x] public community profiles
- [x] improved account/sign-in/profile UX
- [x] mobile avatar compression fallback
- [x] one active session per account
- [x] confirmations around destructive/session-changing actions
- [x] admin access/diagnostics verification

## Stable baseline

The Stable V1 production baseline remains subject to normal regression monitoring. Any post-release compatible defect is handled as a v1.0.x patch; compatible feature work moves to v1.1+.
