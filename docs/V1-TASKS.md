# MangaFlux V1 tasks

## Infrastructure / accounts / persistence

- [x] Vercel + Render + Neon
- [x] CI / secret scan / migration checks / dependency audit
- [x] verified accounts + Resend recovery
- [x] device/account bookmarks, history, progress, Continue Reading

## Reader

- [x] MangaDex search/details/chapters/image proxy
- [x] all chapters with pagination/sorting/lookup
- [x] Page X / Y, progress, previous/next, Data Saver
- [x] tap reader chrome
- [x] persistent reader HUD
- [x] scroll-to-top + centered chapter-home action

## Discovery

- [x] landing page and signed-in dashboard
- [x] header autocomplete
- [x] genre/theme browsing
- [x] clickable metadata filters
- [x] Hot / Popular / Top Rated / Latest Updates
- [x] discovery pagination

## Community / profiles

- [x] profile name/avatar
- [x] manga/chapter comments
- [x] five-minute comment cooldown
- [x] reactions
- [x] comment pagination
- [x] own-comment deletion
- [x] public comments hide account email

## Recommendations

- [x] explicit related titles
- [x] Because you read…
- [x] metadata similarity
- [x] personalized dashboard discovery
- [x] exclude recent/bookmarked titles

## Reliability

- [x] public system status
- [x] MangaDex source-health probe
- [x] Neon persistence-health probe
- [x] transient safe-read retry/backoff
- [x] request timeouts / Retry-After handling
- [x] degraded-state status links
- [ ] optional production monitoring
- [ ] caching/revalidation review
- [ ] rate-limit scaling review
- [ ] production performance review

## Final stabilization

- [ ] iPhone/mobile regression QA
- [ ] tablet/desktop regression QA
- [ ] accessibility QA
- [ ] final auth/community/security/dependency/migration audit
- [ ] production smoke test
- [ ] branch/repository cleanup
- [ ] v1.0.0 release tag
