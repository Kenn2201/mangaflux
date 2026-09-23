# MangaFlux — Versioning & Release Checklist

MangaFlux follows Semantic Versioning.

The repository is currently pre-1.0.

- 0.MINOR.0 means a meaningful V1 milestone or behavior change.
- 0.MINOR.PATCH means a compatible bug or security fix to that milestone.
- 1.0.0 is the first stable release that meets the V1 finish line.

## Current version

v0.2.1 — Security Patch

The canonical machine-readable version is the root package.json. Private workspace package versions should be updated to the same value during a release.

## Release checklist

Before merging a release into main:

1. Update the root and private workspace package versions.
2. Update CHANGELOG.md.
3. Update the version badge and status in README and the landing page when shown.
4. Run npm run check:secrets.
5. Run npm run typecheck.
6. Run npm run build.
7. Run npm run audit.
8. Verify no secret was added to a NEXT_PUBLIC_ variable.
9. Merge only after CI passes.
10. Verify Render and Vercel production deployments.
11. For stable releases, create the matching Git tag, for example v1.0.0.

## Branch workflow

- main is the deployable production branch.
- kenn/* branches are used for development, security, and release work.

Use pull requests for security, dependency, schema, and authentication work so CI can validate changes before production deployment.
