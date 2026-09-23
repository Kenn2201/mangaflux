# MangaFlux

> A modular manga reader and source-adapter platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.5.1--Transactional_Email-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.5.1 — Transactional Email**

MangaFlux now adds verified-email accounts and password recovery through Resend while preserving the v0.5 account/session architecture.

## Transactional email

Production sender:

~~~text
MangaFlux <noreply@manga.kenncode.me>
~~~

Render-only configuration:

~~~text
RESEND_API_KEY=<Resend API key>
EMAIL_FROM=MangaFlux <noreply@manga.kenncode.me>
APP_ORIGIN=https://manga.kenncode.me
~~~

Never expose `RESEND_API_KEY` through `NEXT_PUBLIC_*` or commit it.

### Email flows

~~~text
Create account
  ↓
24-hour verification token
  ↓
Resend branded verification email
  ↓
Verify email
  ↓
Sign in

Forgot password
  ↓
generic recovery response
  ↓
30-minute one-time reset email
  ↓
new password
  ↓
all old sessions revoked
~~~

Verification and reset token **hashes** are stored in Neon; raw tokens exist only in the outbound link.

## Account + reader features

- MangaDex search/details/chapters
- bounded image proxy
- Page X / Y + reader progress
- previous/next chapters
- data saver
- bookmarks/history/Continue Reading
- anonymous device persistence
- account signup/login/logout
- account library sync
- email verification
- password recovery

## Resend receiving

Inbound/receiving is optional and separate from transactional sending. MangaFlux does not yet consume inbound-email webhooks. It can later power support/reply workflows without changing the outbound verification/reset implementation.

## Deployment

- Vercel: `manga.kenncode.me`
- Render: `api.manga.kenncode.me`
- Neon: Postgres persistence/auth state
- Resend: transactional email

The next roadmap phase remains v0.6–v0.9 V1 stabilization.
