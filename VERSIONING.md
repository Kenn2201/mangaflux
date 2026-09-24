# MangaFlux — Versioning & Release Checklist

MangaFlux follows Semantic Versioning.

## Current version

**v0.7.2 — Community & Profiles**

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
8. Verify community writes require verified sessions.
9. Verify comment cooldown and own-comment deletion.
10. Verify avatar size/type validation.
11. Test manga + chapter community on iPhone Safari.
12. Merge only after CI passes.
13. Verify Render migration/health and Vercel deployment.

## Branch workflow

- `main`: deployable production
- `kenn/*`: development and release branches
