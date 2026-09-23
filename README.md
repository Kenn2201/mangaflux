# MangaFlux

> A mobile-first modular manga reader and source-adapter platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.6.0--Mobile_UX-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.6.0 — Mobile UX Foundation**

The v0.6 milestone turns the working v0.5 reader/account stack into a more coherent mobile product.

### UX foundation

- sticky MangaFlux app header
- iPhone-safe mobile bottom navigation
- skeleton states for account, library, search, manga details, and reader
- account session loading no longer flashes the signed-out form
- redesigned account/profile dashboard with library stats and security controls
- global success/error/info toast system
- Anime.js route/toast micro-interactions
- reduced-motion support
- improved touch targets and responsive spacing
- iOS autofill styling that stays inside the dark MangaFlux visual system
- shared site footer outside the distraction-free reader

Anime.js is used selectively for short, non-essential motion. The product remains fully usable with reduced motion enabled.

## Current capabilities

- MangaDex search/details/chapters
- bounded MangaDex image proxy
- responsive vertical reader
- Page X / Y + live progress
- previous/next chapter navigation
- data saver
- bookmarks/history/Continue Reading
- device persistence
- account signup/login/logout
- verified email + password recovery through Resend
- account-backed library/progress
- mobile-first shell, skeletons, notifications, and profile UI

## Deployment

- Vercel: `manga.kenncode.me`
- Render: `api.manga.kenncode.me`
- Neon: persistence/auth
- Resend: transactional email
- MangaDex: current V1 source

## Roadmap

Next: v0.7 Reader + Library polish, followed by v0.8 reliability/source health and v0.9 final accessibility/security/production QA before v1.0.0.
