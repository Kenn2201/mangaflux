# MangaFlux — Versioning & Release Checklist

MangaFlux follows Semantic Versioning.

The repository is currently pre-1.0.

- `0.MINOR.0` means a meaningful V1 milestone or behavior change.
- `0.MINOR.PATCH` means a compatible bug or security fix to that milestone.
- `1.0.0` is the first stable release that meets the V1 finish line.

## Current version

**v0.5.0 — Authentication**

The canonical machine-readable version is the root `package.json`. Private workspace package versions stay synchronized during a release.

## Release checklist

Before merging a release into `main`:

1. Update root/workspace package versions.
2. Update `CHANGELOG.md`.
3. Update README and visible app version.
4. Run `npm run check:secrets`.
5. Run `npm run check:migrations`.
6. Run `npm run typecheck`.
7. Run `npm run build`.
8. Run `npm run audit`.
9. Verify no secret uses a `NEXT_PUBLIC_*` variable.
10. Merge only after CI passes.
11. Verify Render migrations/startup and Vercel deployment.
12. Verify auth secrets are configured on both Render and Vercel before enabling account tests.
13. Stable releases receive the matching Git tag.

## Branch workflow

- `main`: deployable production
- `kenn/*`: development, security, database, and release branches

Use pull requests so CI validates each milestone before production deployment.
