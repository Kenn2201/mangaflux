# MangaFlux

> A mobile-first modular manga discovery and reading platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.7.0--Discovery_Dashboard-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Current release

**v0.7.0 — Discovery & Dashboard**

MangaFlux now separates public discovery from the signed-in reading dashboard and moves search into the application header.

### Discovery

- YouTube-style live manga search suggestions with cover/title/year/tag context
- dedicated search-results page
- MangaFlux Hot
- Popular / most-followed manga
- Top Rated
- Latest Updates
- genre browser in the header
- genre discovery shelves
- Show All discovery pages with pagination
- dedicated signed-in Dashboard

MangaFlux Hot is intentionally labeled as a MangaFlux ranking. It blends recent chapter activity and popularity rather than presenting itself as an official MangaDex trending chart.

## Current product structure

~~~text
/
Public landing + discovery
  |- MangaFlux Hot
  |- Popular
  |- Top Rated
  |- Latest Updates
  '- Genres

/dashboard
Signed-in reading dashboard
  |- Continue Reading
  |- Bookmarks
  |- Recent reading
  '- Discovery

/search?q=...
Header-driven search results

/browse?kind=popular&page=...
Paginated discovery
~~~

## Existing reader/account stack

- MangaDex search/details/chapters
- bounded image proxy
- vertical mobile reader
- Page X / Y and saved reading progress
- previous/next chapter controls
- Data Saver
- bookmarks/history/Continue Reading
- Neon persistence
- verified MangaFlux accounts
- Resend verification/password recovery
- mobile app shell, skeleton states, and toast feedback

## Roadmap

Next: **v0.7.1 Chapter Scale & Reader Controls**, including the current 100-chapter ceiling, chapter pagination, and tap-to-show reader chrome.

Then v0.7.2 adds community/profile features and v0.7.3 adds recommendations before the v0.8 reliability phase.
