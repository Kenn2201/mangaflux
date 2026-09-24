# MangaFlux — Versioning & Release Checklist

MangaFlux follows Semantic Versioning.

## Current version

**v0.8.0 — Reliability & Source Health**

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
7. Verify lightweight `/health` still responds without deep probes.
8. Verify `/api/status` reports MangaDex and Neon health without exposing secrets.
9. Verify retries only target safe idempotent reads.
10. Verify aborts still cancel stale live-search/navigation requests.
11. Verify degraded UI links to system status.
12. Merge only after CI passes.
13. Smoke test Render health, status page, search, discovery, and reader on iPhone Safari.

## Branch workflow

- `main`: deployable production
- `kenn/*`: temporary development/release branches
- merged `kenn/*` branches may be deleted after the PR is safely merged; PR and commit history remain on GitHub
