# MangaFlux

> A mobile-first modular manga discovery and reading platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.7.1--Chapter_Scale_Reader-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.7.1 — Chapter Scale & Reader Controls**

This release fixes the first v0.7 production bug and removes the 100-chapter product ceiling.

### Chapter scale

- chapter pages now use real MangaDex pagination
- manga with 100+ chapters can reach older chapters instead of silently stopping at the first 100
- 50 chapters per MangaFlux page
- Newest / Oldest sorting
- exact chapter-number lookup such as 1, 12, or 12.5
- reader neighbor lookup scans paginated chapter pages so previous/next navigation is no longer limited to the newest 100 entries

### Reader controls

- distraction-free reader chrome auto-hides
- tap the page area to reveal reader controls again
- persistent centered Page X / Y pill
- persistent thin reading progress meter
- overlay previous/next chapter controls
- Data Saver remains available from the reader chrome
- lower-right scroll-to-top control
- reading progress save status remains available in the revealed chrome

### Fixes

- fixed the v0.7.0 genre menu request loop that could leave the mobile genre sheet loading indefinitely
- added a visible retry state if genre loading genuinely fails

## Existing product structure

~~~text
/
Landing + discovery

/dashboard
Account reading dashboard

/search?q=...
Live-search results

/browse?kind=...
Paginated discovery

/manga/:id
Manga details + scalable chapter pages

/read/:chapterId
Immersive tap-controlled reader
~~~

## Roadmap

Next: **v0.7.2 Community & Profiles** with MangaFlux-native comments, reactions, and profile avatars.

Then v0.7.3 adds recommendations before the v0.8 reliability/source-health phase.
