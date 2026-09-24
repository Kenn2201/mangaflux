# MangaFlux Roadmap

## v1.x — Stable MangaFlux product

### v1.0.0 — Stable V1
- mobile-first landing/dashboard/discovery
- autocomplete search, genres, ranking and filtering
- complete chapter pagination/direct lookup
- immersive reader with resume/progress/Data Saver/chapter jump
- verified accounts and password recovery
- one active login session per account
- bookmarks/history/Continue Reading
- avatars and public community profiles
- reactions/comments with server-side cooldowns
- recommendations
- admin operations
- status/diagnostics/caching/rate-limit/security hardening
- release CI and accessibility foundation

### v1.1.x — Library & Reading Quality
- richer library sorting/filtering
- reading-history controls
- per-series reading preferences
- chapter language preference UI
- stronger reader settings sheet
- better duplicate/scanlation-group chapter handling
- additional mobile/tablet polish

### v1.2.x — Profiles & Community Depth
- richer public profile presentation
- optional profile bio/preferences with privacy controls
- better activity browsing
- comment/reaction UX refinements
- account-level notification preferences
- stronger admin community tools without exposing private credentials/data

### v1.3.x — Following & Notifications
- follow series separately from bookmark/reading state
- latest-chapter notification preferences
- optional transactional email notifications
- optional Discord/webhook integration for followed-series updates
- notification inbox/history
- quiet/disable controls and rate limits

### v1.4.x — Discovery & Personalization
- improved recommendation explanations
- preference-aware recommendations based on explicit MangaFlux activity
- saved discovery filters
- recently viewed/search history controls
- richer ranking/discovery views
- better language/genre/status preference controls

### v1.5+ — Stable-product improvements
- PWA/app-shell improvements
- installability and offline-safe application shell/state where appropriate
- performance/accessibility improvements
- operational scaling only when traffic requires it
- shared Redis/edge rate limits only if MangaFlux becomes multi-instance

---

## v2.x — Permitted multi-source MangaFlux

V2 changes MangaFlux from a MangaDex product into a source-federated reader architecture.

### v2.0.x — Source Platform Foundation
- source registry and capabilities model
- normalized manga/chapter/search interfaces
- per-source health and configuration
- per-source rate/cache policies
- source attribution everywhere
- official/public APIs first
- HTML adapters only where explicitly permitted
- no CAPTCHA/paywall/login-wall/anti-bot bypasses

### v2.1.x — Unified Search
- search multiple permitted sources
- merged result presentation
- source badges
- normalized metadata
- deterministic title matching
- duplicate candidate detection

### v2.2.x — Cross-Source Matching & Deduplication
- canonical MangaFlux title identity
- source-edition mapping
- confidence-based duplicate matching
- manual/admin correction tools
- preserve per-source attribution and chapter provenance

### v2.3.x — Source Selection & Fallback
- choose preferred source per title
- source availability/health awareness
- safe fallback when an equivalent permitted source exists
- per-source language/quality preferences
- migration of bookmarks/progress to canonical title identities where possible

### v2.4+ — Multi-source Operations
- adapter fixtures/test harness
- source SDK/documentation
- source-specific diagnostics
- queue/background jobs where needed
- shared caching/rate limiting when multi-instance scale requires it

---

## v3.x — Intelligent & Multi-client MangaFlux

V3 focuses on discovery intelligence, personalization, richer social/product features, and additional clients rather than simply adding more sources.

### v3.0.x — Semantic Discovery
- metadata/embedding-assisted manga search
- natural-language discovery such as “short completed mystery manga”
- semantic similarity recommendations
- grounded results tied to MangaFlux/source metadata
- explanation of why a title matched

### v3.1.x — Advanced Personalization
- opt-in taste profile
- custom reading lists/collections
- recommendation controls: more/less like this, hide title/genre
- stronger recommendation transparency
- privacy controls and reset/delete preference history

### v3.2.x — Richer Social Layer
- optional profile/list sharing
- public/private/custom lists
- activity controls
- follow readers only if implemented with clear privacy controls
- stronger anti-abuse/admin tooling before expanding social features

### v3.3.x — PWA / Native Clients
- mature installable PWA
- possible Flutter/native iOS/Android client using the same MangaFlux API
- synchronized library/progress/preferences
- mobile notification support
- accessibility parity across clients

### v3.4+ — Platform Ecosystem
- public/source adapter SDK where appropriate
- documented API contracts
- richer analytics/operations
- import/export of user-owned MangaFlux data
- future integrations and experimental interfaces without weakening V1/V2 security boundaries
