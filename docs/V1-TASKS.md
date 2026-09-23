# MangaFlux V1 tasks

## Infrastructure and security

- [x] Public GitHub repository
- [x] Next.js frontend
- [x] Fastify API
- [x] Vercel deployment target
- [x] Render deployment target
- [x] Custom frontend/API domains
- [x] Render health endpoint
- [x] Neon project
- [x] cron-job.org health wake
- [x] CI secret scan, migration check, typecheck, build, and dependency audit
- [x] Input validation and basic rate limiting
- [x] Bounded source runtime and image proxy

## MangaDex reader

- [x] Common source interface
- [x] Restricted fetchSource runtime
- [x] Search and cover art
- [x] Manga details, tags, authors, and artists
- [x] Chapter listing and English default
- [x] Scanlation-group metadata
- [x] MangaDex At-Home page resolution
- [x] Normal/data-saver image proxy
- [x] Search, details, chapter-list, and vertical-reader UI
- [x] MangaDex/source attribution
- [x] Preserve search query across navigation
- [x] Current Page X / Y tracking and progress bar
- [x] Previous/next chapter navigation
- [x] Reader data-saver toggle

## Persistence

- [x] Wire Neon database client
- [x] Add checked-in Drizzle runtime migrations
- [x] Add bookmarks
- [x] Add reading progress
- [x] Add recent-reading history
- [x] Add Continue Reading
- [x] Add page resume
- [x] Add device-scoped HttpOnly reader identity

## Accounts

- [ ] Add authentication
- [ ] Bind library/progress/history to authenticated sessions
- [ ] Migrate or merge device state into the signed-in account
- [ ] Add account/session security controls

## V1 stabilization

- [ ] Add pagination/lazy chapter loading for very large series
- [ ] Add source health/status panel
- [ ] Add optional production error monitoring
- [ ] Mobile QA on iPhone
- [ ] Accessibility QA
- [ ] Final security/dependency/migration audit
- [ ] V1 release tag
