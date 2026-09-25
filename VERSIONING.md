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

MangaFlux development uses:

- `main`: deployable production and the PR target.
- `kenn/develop`: a clean development baseline that is synchronized to merged `main`, not a branch for repeated incremental pushes.
- temporary `kenn/work-*` branches: isolated in-progress implementation branches.

Workflow:

~~~text
main
  ↓
temporary kenn/work-* branch
  ↓
complete implementation + fixes + docs
  ↓
one final PR to main
  ↓
CI gate
  ↓
main
  ↓
sync kenn/develop to main
~~~

Do not push every implementation step to `kenn/develop`. Keep intermediate commits on the temporary work branch and open the PR only when the release slice is complete enough for the full gate.
