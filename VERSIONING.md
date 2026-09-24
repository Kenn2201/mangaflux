# MangaFlux — Versioning & Release Checklist

MangaFlux follows Semantic Versioning.

## Current version

**v0.9.1 — RC UX & Account Hardening**

- `0.MINOR.0` = meaningful pre-V1 milestone
- `0.MINOR.PATCH` = compatible focused pre-V1 fix
- `1.0.0` = stable V1 finish line

## v0.9 policy

v0.9.x is feature-frozen for major product work. Changes should primarily be regression fixes, accessibility/security/reliability hardening, and small UX gaps discovered by production testing.

## Automated gate

Before merging into `main`:

1. Secret scan.
2. Migration-journal validation.
3. Release-invariant validation.
4. TypeScript checks.
5. Production build.
6. Dependency audit.

## Manual gate

Use `docs/V1-RELEASE-CHECKLIST.md`.

The final v1.0.0 tag must come from a production-tested main commit after blocking v0.9 findings are resolved.

## Branch workflow

- `main`: deployable production
- `kenn/*`: temporary development/release branches
- merged `kenn/*` branches may be deleted after merge; PR/commit history remains
