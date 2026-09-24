# MangaFlux — Versioning & Release Checklist

MangaFlux follows Semantic Versioning.

## Current version

**v0.7.0 — Discovery & Dashboard**

- `0.MINOR.0` = meaningful pre-V1 milestone
- `0.MINOR.PATCH` = compatible fix or focused improvement
- `1.0.0` = stable V1 finish line

## Release checklist

Before merging into `main`:

1. Synchronize root/workspace versions.
2. Update changelog/docs/app version.
3. Run secret scan and migration validation.
4. Run TypeScript checks and production builds.
5. Run dependency audit.
6. Keep database/auth/Resend secrets out of `NEXT_PUBLIC_*`.
7. Verify source attribution and permitted-source behavior.
8. Verify discovery/search request pacing and rate limits.
9. Merge only after CI passes.
10. Verify Render health and Vercel production deployment.
11. Smoke test discovery on iPhone Safari before the next milestone.
12. Stable releases receive a matching Git tag.

## Branch workflow

- `main`: deployable production
- `kenn/*`: development and release branches
