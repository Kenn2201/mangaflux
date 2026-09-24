# MangaFlux

> A mobile-first modular manga discovery, reading, and community platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.7.2--Community_Profiles-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.7.2 — Community & Profiles**

MangaFlux now has account-native community identity, reactions, and comments while keeping the reader mobile-first.

### Community

- Manga-level reactions and comments
- Chapter-level reactions and comments
- verified MangaFlux account required to post/react
- one comment every 5 minutes per account
- 1,000-character comment limit
- paginated comments
- users can delete their own comments
- reaction choices: Like, Funny, Wow, Sad, Fire
- no moderation dashboard in this milestone

### Profiles

- display names
- profile avatar upload
- client-side square crop/compression to WebP
- public comments show display name/avatar, never account email
- header account chip supports profile avatars

For this pre-V1 release, compact avatar images are stored with the user's Neon profile record after local WebP normalization. Manga pages themselves are still never mirrored into MangaFlux storage.

### v0.7.1 physical-audit fixes included

- genre sheet is rendered through a document portal so iPhone Safari no longer constrains it inside the sticky header
- genre menu includes **Browse more genres**
- dedicated Genres & Themes directory
- manga detail tags are clickable discovery links
- reader header shows the manga cover
- reader bottom controls now have a centered Chapters/Home button
- scroll-to-top uses a centered SVG arrow instead of a text glyph

## Product structure

~~~text
/
Landing + discovery

/dashboard
Signed-in reading dashboard

/genres
Genre and theme directory

/manga/:id
Manga details, chapters, reactions, comments

/read/:chapterId
Immersive reader + chapter community at the end

/account
Account, profile avatar/name, security
~~~

## Roadmap

Next: **v0.7.3 Recommendations**, starting with tag/genre similarity, related titles, history/bookmark signals, and personalized dashboard discovery.

Then v0.8 focuses on reliability and source health.
