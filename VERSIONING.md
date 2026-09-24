# MangaFlux — Versioning & Release Checklist

MangaFlux follows Semantic Versioning.

## Current version

**v0.8.2 — Diagnostics & Observability**

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
6. Verify `ADMIN_EMAILS` is configured only on the trusted API service.
7. Verify public status exposes only admin configured/disabled state.
8. Verify admin diagnostics require a verified admin session.
9. Verify diagnostics contain no request bodies, queries, IPs, auth headers, emails, passwords, tokens, or keys.
10. Verify `/health` remains lightweight.
11. Merge only after CI passes.
12. Smoke-test `/status`, `/admin`, diagnostics, and normal reader/discovery flows.

## Branch workflow

- `main`: deployable production
- `kenn/*`: temporary development/release branches
- merged `kenn/*` branches may be deleted after merge; PR/commit history remains
