# MangaFlux Roadmap

This is the canonical MangaFlux roadmap.

## v1.x — Stable MangaFlux product

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

#### v1.1.0 — Library & Reader Settings Foundation — complete
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

#### v1.1.1 — Preference Sync & Scanlation Controls — next
- define safe account-sync behavior for per-series reader preferences
- keep browser-local preferences as a resilient fallback
- synchronize supported reader preferences for signed-in users without overwriting newer choices
- add optional preferred scanlation-group behavior per series
- improve alternate-release/group selection controls
- preserve explicit source/group attribution in chapter UI
- add focused history-management refinements discovered during v1.1.0 testing
- complete tablet/landscape QA for Library, chapter controls, and Reader Settings

#### Later v1.1.x
- stronger per-series reading preferences
- reader typography/spacing/fit preferences where useful
- additional reading-quality refinements based on real usage
- final v1.1.x regression/accessibility polish before v1.2.x

### v1.2.x — Profiles & Community Depth
- richer public profiles
- optional bio/preferences with privacy controls
- better activity browsing
- comment/reaction UX refinements
- notification/privacy preferences groundwork
- stronger admin community tools without exposing credentials/private account data

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

### v1.5+ — Product polish
- PWA/installability
- faster application shell
- accessibility/performance improvements
- offline-safe shell/state where appropriate
- scaling work only when real production traffic requires it
- shared Redis/edge rate limiting only when MangaFlux is actually multi-instance

---

## v2.x — Multi-source + Platform Expansion

v2.x is intentionally a large phase. MangaFlux should complete the important source/platform architecture work here before moving major scope into v3.x.

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

### v2.1.x — Unified Multi-source Search
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

### v2.4.x — Cross-source Library Migration & Provenance
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

### v2.6.x — Multi-source Operations & Scale
- source-specific diagnostics
- background queues/jobs where needed
- shared caching where justified
- distributed rate limiting when multiple API instances exist
- source incident/degraded-state controls
- operational/admin source controls

### v2.7+ — Platform maturity before v3
- additional permitted sources
- migration tooling refinements
- source quality scoring based on concrete metadata/availability signals
- better canonical matching
- platform stability/security work
- only move to v3 when multi-source architecture is mature

---

## v3.x — Intelligent & Multi-client MangaFlux

v3 scope stays intentionally later. New architecture/platform ideas that belong in v2 should be added to v2 first.

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

### v3.2.x — Richer Social Layer
- optional shareable lists
- public/private/custom lists
- activity controls
- optional reader following only with privacy/anti-abuse controls
- stronger moderation/admin tooling before social expansion

### v3.3.x — Native / Mature PWA
- mature installable PWA
- possible Flutter iOS/Android client
- shared MangaFlux API/account
- synchronized library/progress/preferences
- mobile notifications
- accessibility parity across clients

### v3.4+ — Platform Ecosystem
- documented API contracts
- user-owned data import/export
- richer analytics/operations
- source/adapter developer ecosystem
- future integrations and experimental clients without weakening V1/V2 security boundaries
