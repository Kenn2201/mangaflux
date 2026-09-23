# MangaFlux — Versioning & Release Checklist

MangaFlux follows Semantic Versioning.

The repository is currently pre-1.0.

- `0.MINOR.0` means a meaningful V1 milestone or behavior change.
- `0.MINOR.PATCH` means a compatible bug or security fix to that milestone.
- `1.0.0` is the first stable release that meets the V1 finish line.

## Current version

**v0.4.0 — Neon Persistence**

The canonical machine-readable version is the root `package.json`. Private workspace package versions are kept in sync for each release.

## Release checklist

Before merging a release into `main`:

1. Update the root and private workspace package versions.
2. Update `CHANGELOG.md`.
3. Update the README badge/status and landing-page version when shown.
4. Run `npm run check:secrets`.
5. Run `npm run check:migrations`.
6. Run `npm run typecheck`.
7. Run `npm run build`.
8. Run `npm run audit`.
9. Verify no secret was added to a `NEXT_PUBLIC_*` variable.
10. Merge only after CI passes.
11. Verify Render migrations/startup and the Vercel production deployment.
12. For stable releases, create the matching Git tag, for example `v1.0.0`.

## Branch workflow

- `main`: deployable production branch
- `kenn/*`: development, security, database, and release branches

Use pull requests so CI validates each milestone before production deployment.
