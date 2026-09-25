# MangaFlux — Versioning & Release Policy

MangaFlux follows Semantic Versioning.

## Current version

**v1.1.2 — Reader Layout Controls**

- `PATCH` = compatible bug/security/reliability fixes and focused compatible release slices
- `MINOR` = compatible larger feature milestones
- `MAJOR` = deliberate platform/architecture changes that may require migrations or compatibility work

## Stable release gate

Before merging into `main`:

1. Secret scan.
2. Migration-journal validation.
3. Release-invariant validation.
4. TypeScript checks.
5. Production build.
6. Dependency audit.
7. Physical production testing appropriate to the release scope.

## Version families

- **1.x:** deepen the stable MangaDex product.
- **2.x:** multi-source and platform architecture. v2.x intentionally has multiple milestones before v3 work starts.
- **3.x:** semantic discovery, advanced personalization, richer social features, native/PWA clients, and ecosystem work.

## Branch workflow

MangaFlux development uses exactly two persistent branches for project work:

- `main`: deployable production and the PR target.
- `kenn/develop`: the single development branch for implementation, fixes, documentation, and release preparation.

Workflow:

~~~text
main
  ↓
kenn/develop
  ↓
complete implementation + fixes + docs
  ↓
one PR to main
  ↓
CI gate
  ↓
main
  ↓
reset kenn/develop to main
~~~

Do not create temporary `kenn/work-*`, version-specific, or fix branches for normal MangaFlux development. Keep the full release on `kenn/develop`, open one complete PR to `main`, merge only after the CI gate passes, then reset `kenn/develop` to the merged `main` head.
