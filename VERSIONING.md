# MangaFlux — Versioning & Release Checklist

MangaFlux follows Semantic Versioning.

## Current version

**v0.8.3 — Cache, Rate Limits & Performance Hardening**

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
6. Verify only public MangaDex-derived GET data receives public cache headers.
7. Verify errors and all authenticated/private responses remain no-store.
8. Verify repeated identical public requests can be coalesced/cached without changing payloads.
9. Verify cache and rate-limit maps are bounded.
10. Verify search/discovery/chapter freshness windows are acceptable.
11. Verify `/health` remains lightweight and `/status` remains deeper diagnostics.
12. Merge only after CI passes.
13. Smoke-test iPhone search, discovery, manga details, chapters, reader, account, admin, and status.

## Branch workflow

- `main`: deployable production
- `kenn/*`: temporary development/release branches
- merged `kenn/*` branches may be deleted after merge; PR/commit history remains
