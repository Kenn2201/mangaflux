# MangaFlux — Versioning & Release Checklist

MangaFlux follows Semantic Versioning.

## Current version

**v0.7.1 — Chapter Scale & Reader Controls**

- `0.MINOR.0` = meaningful pre-V1 milestone
- `0.MINOR.PATCH` = compatible focused milestone/fix during pre-V1
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
8. Verify search/discovery/chapter request pacing and rate limits.
9. Test at least one series with more than 100 chapters.
10. Test reader controls on iPhone Safari.
11. Merge only after CI passes.
12. Verify Render health and Vercel deployment.

## Branch workflow

- `main`: deployable production
- `kenn/*`: development and release branches
