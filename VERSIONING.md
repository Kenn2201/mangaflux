# MangaFlux — Versioning & Release Policy

MangaFlux follows Semantic Versioning.

## Current version

**v1.0.0 — Stable V1**

- `PATCH` = compatible bug/security/reliability fixes
- `MINOR` = compatible new features
- `MAJOR` = deliberate platform/architecture changes that may require migrations or compatibility work

## Stable release gate

Before merging a release into `main`:

1. Secret scan.
2. Migration-journal validation.
3. Release-invariant validation.
4. TypeScript checks.
5. Production build.
6. Dependency audit.
7. Physical production testing appropriate to the release scope.

## Version families

- **1.x:** stable MangaDex product evolution
- **2.x:** permitted multi-source architecture
- **3.x:** semantic discovery, personalization, richer clients/platform capabilities

## Branch workflow

- `main`: deployable production
- `kenn/*`: temporary development/release branches
- merged temporary branches may be deleted after merge; PR and commit history remain
