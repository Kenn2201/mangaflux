# MangaFlux

> A mobile-first modular manga discovery, reading, community, recommendation, and reliability-focused platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.8.1--Admin_Operations-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.8.1 — Admin Operations**

MangaFlux now includes a deliberately small administrator console for operational visibility and safety controls.

### Admin access

Administrator identity is configured server-side through:

~~~text
ADMIN_EMAILS
~~~

It accepts one or more comma-separated verified MangaFlux account emails.

The allowlist belongs on the Render API service only. It is never a `NEXT_PUBLIC_*` variable and should not be committed with personal email addresses.

### Admin console

`/admin` can show:

- total users
- active sessions
- community comments
- reactions
- bookmarks
- reading-progress records
- recent user accounts
- recent community comments
- link to live MangaFlux system status

Administrators can:

- remove a community comment
- revoke all active sessions for another user
- review limited account/community metadata needed for operations

Administrators cannot:

- view password hashes or passwords
- view raw session tokens
- reveal API keys or deployment secrets
- reset another user's password from the console
- run arbitrary SQL
- edit Render/Vercel environment variables
- delete user accounts

### Security model

Admin authorization is enforced by the Fastify API after the normal MangaFlux proxy-secret + bearer-session checks. The frontend does not decide whether an account is an administrator.

## Reliability phase

~~~text
v0.8.0  Reliability & Source Health
v0.8.1  Admin Operations
~~~

Next v0.8.x work remains monitoring, cache/rate-limit review, and performance hardening before the v0.9 release candidate.
