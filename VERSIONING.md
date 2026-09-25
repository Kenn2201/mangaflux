# MangaFlux — Versioning & Release Policy

MangaFlux follows Semantic Versioning.

## Current version

**v1.1.0 — Library & Reader Settings Foundation**

- `PATCH` = compatible bug/security/reliability fixes
- `MINOR` = compatible new features
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

MangaFlux development now uses:

- `main`: deployable production.
- `kenn/develop`: the single persistent ChatGPT-assisted development branch.

Workflow:

~~~text
main
 ↓
kenn/develop
 ↓
PR + CI
 ↓
main
 ↓
reset kenn/develop to main
~~~

Do not create version-specific `kenn/*` branches for new work.
