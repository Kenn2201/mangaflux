# MangaFlux Roadmap

This is the canonical MangaFlux roadmap.

## Current progression

- ✅ **v1.0.0 — Stable V1**
- ➡️ **v1.1.x — Library & Reading Quality — CURRENT**
  - ✅ **v1.1.0 — Library + Reader Settings Foundation**
  - ➡️ **v1.1.1 — Reading Quality Refinements — NEXT**
- **v1.2.x — Profiles & Community Depth**
- **v1.3.x — Following & Notifications**
- **v1.4.x — Discovery & Personalization**
- **v1.5+ — Product Polish**

After the 1.x product is mature, MangaFlux enters the deliberately larger **v2.x — Multi-Source + Platform Expansion** phase. v2.x is intentionally open for more architecture, source, platform, data, migration, operations, and scaling milestones before major scope is moved into v3.x.

---

## v1.x — Stable MangaFlux Product

### v1.0.0 — Stable V1 — complete
- mobile-first landing/dashboard/discovery
- autocomplete search, genres, rankings, and filters
- complete chapter pagination/direct lookup
- immersive reader with progress, Data Saver, chapter jump, and resume
- verified accounts/password recovery
- one active login session per account
- bookmarks/history/Continue Reading
- avatars/public community profiles
- reactions/comments
- recommendations
- admin operations
- status/diagnostics/security/reliability foundation

### v1.1.x — Library & Reading Quality — current

#### v1.1.0 — Library + Reader Settings Foundation — complete
- richer Library filtering/sorting
- reading-history remove/clear controls
- larger persisted Library views
- per-series reader preferences
- preferred chapter language
- proper Reader Settings sheet
- duplicate chapter-number collapse
- alternate scanlation-release toggle
- scanlation group attribution
- mobile/tablet polish

#### v1.1.1 — Reading Quality Refinements — next

Keep this release focused. Do not put every remaining v1.1.x idea into v1.1.1.

- define a safe account-sync strategy for reader preferences
- keep browser-local preferences as a resilient fallback
- improve scanlation-group selection/control
- improve alternate-release selection UX while preserving group attribution
- make remaining reader/chapter quality improvements that naturally build on v1.1.0
- polish issues discovered while testing v1.1.0
- focused history-management refinements where useful
- tablet/landscape QA for Library, Reader Settings, and chapter controls

#### Later v1.1.x
- stronger per-series reading preferences
- reader typography/spacing/fit preferences where useful
- additional reading-quality refinements based on real usage
- final v1.1.x regression/accessibility polish

Do not move to v1.2.x until the Library & Reading Quality phase is considered complete.

### v1.2.x — Profiles & Community Depth
- richer public profiles
- optional bio/preferences
- privacy controls
- improved activity/history display and browsing
- better comments/reactions UX
- notification/privacy preference groundwork
- more community/admin tools without exposing credentials/private account data

### v1.3.x — Following & Notifications
- Follow Manga separate from bookmark/reading state
- new-chapter notification preferences
- email notifications
- notification inbox/history
- optional Discord/webhook notifications
- quiet/disable controls and notification rate limits

### v1.4.x — Discovery & Personalization
- better recommendation explanations
- activity-based recommendations
- saved discovery filters
- recently viewed/search-history controls
- stronger language/genre/status preferences
- richer Hot/Popular/Trending discovery

### v1.5+ — Product Polish
- PWA/installability
- faster application shell
- accessibility/performance improvements
- offline-safe shell/state where appropriate
- scaling work only when real production traffic requires it
- shared Redis/edge rate limiting only when MangaFlux is actually multi-instance

---

## v2.x — Multi-Source + Platform Expansion

**v2.x is intentionally a large, expandable phase.** It is not a single multi-source milestone. If a new feature belongs to source/platform architecture, data, migration, operations, or scaling, extend v2.x first instead of prematurely moving it into v3.x.

The sequence below is a working structure, not a cap. Add v2.7, v2.8, v2.9, v2.10+ as needed before v3.

### v2.0.x — Source Platform Foundation
- source registry
- capabilities model
- normalized manga/chapter/search contracts
- source configuration and health
- attribution requirements
- per-source caching/rate policies
- official/public APIs first
- HTML adapters only where explicitly permitted
- no CAPTCHA/paywall/login-wall/anti-bot bypasses

### v2.1.x — Unified Multi-Source Search
- query multiple permitted sources
- normalized merged results
- source badges
- source-aware metadata
- deterministic title matching
- source filtering

### v2.2.x — Canonical Manga Identity & Deduplication
- canonical MangaFlux title identity
- map source editions to one canonical title
- duplicate candidate detection
- confidence-based matching
- admin/manual corrections
- preserve source provenance

### v2.3.x — Source Selection & Safe Fallback
- preferred source per title
- source availability awareness
- safe fallback when an equivalent permitted source exists
- per-source language/quality preferences
- explicit source switching
- never silently hide attribution

### v2.4.x — Cross-Source Library Migration & Provenance
- map existing MangaDex bookmarks/progress to canonical MangaFlux titles
- preserve original source references
- migration confidence/status UI
- cross-source chapter/progress reconciliation
- safe rollback/repair tools for bad matches

### v2.5.x — Adapter SDK & Testing
- adapter fixtures
- contract tests
- source test harness
- public/internal adapter documentation
- capability validation
- compatibility/version checks

### v2.6.x — Multi-Source Operations & Scale
- source-specific diagnostics
- background queues/jobs where needed
- shared caching where justified
- distributed rate limiting when multiple API instances exist
- source incident/degraded-state controls
- operational/admin source controls

### v2.7+ — Platform Expansion / Maturity
- intentionally open for additional permitted sources and platform milestones
- migration tooling refinements
- source quality signals based on concrete metadata/availability
- better canonical matching
- data architecture and scaling work as actual needs emerge
- platform stability/security work
- additional v2.x milestones before v3 whenever they fit the multi-source/platform evolution

---

## v3.x — Future / Advanced MangaFlux

v3.x stays intentionally later. Do not prematurely move architecture/platform ideas here when they belong in v2.x.

### v3.0.x — Semantic Discovery
- metadata/embedding-assisted search
- natural-language discovery
- semantic similarity recommendations
- grounded explanations for matches

### v3.1.x — Advanced Personalization
- opt-in taste profile
- custom reading lists/collections
- more/less-like-this controls
- hide title/genre controls
- recommendation transparency
- reset/delete preference history

### v3.2.x — Richer Social Features
- optional shareable lists
- public/private/custom lists
- activity controls
- optional reader following only with privacy/anti-abuse controls
- stronger moderation/admin tooling before social expansion

### v3.3.x — Native / Flutter App
- mature installable PWA
- possible Flutter iOS/Android client
- shared MangaFlux API/account
- synchronized library/progress/preferences
- mobile notifications
- accessibility parity across clients

### v3.4+ — Platform/API Ecosystem
- documented API contracts
- user-owned data import/export
- richer analytics/operations
- source/adapter developer ecosystem
- future integrations and experimental clients without weakening V1/V2 security boundaries

Additional advanced ideas can be added later after the v2.x platform work is mature.
