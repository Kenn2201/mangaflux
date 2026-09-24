# MangaFlux — Versioning & Release Checklist

MangaFlux follows Semantic Versioning.

## Current version

**v0.8.1 — Admin Operations**

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
6. Keep `ADMIN_EMAILS`, database/auth/Resend secrets out of `NEXT_PUBLIC_*`.
7. Verify non-admin accounts receive 403 from admin API routes.
8. Verify admin console never returns password hashes/tokens/secrets.
9. Verify comment removal and user-session revocation are admin-only.
10. Verify the current admin cannot bulk-revoke its own sessions.
11. Merge only after CI passes.
12. Smoke test `/admin`, `/status`, account role display, and normal user flows on iPhone Safari.

## Branch workflow

- `main`: deployable production
- `kenn/*`: temporary development/release branches
- merged `kenn/*` branches may be deleted after merge; PR/commit history remains
