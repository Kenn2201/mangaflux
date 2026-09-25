# MangaFlux Roadmap

This is the canonical MangaFlux roadmap.

## Where we are right now

~~~text
v1.0.0  ████████████████████  ✅
v1.1.0  ████████████████████  ✅
v1.1.1  ░░░░░░░░░░░░░░░░░░░░  ← NEXT
v1.2.x  Profiles & Community
v1.3.x  Following & Notifications
v1.4.x  Discovery & Personalization
v1.5+   Product Polish
         ↓
v2.x    Multi-Source + Platform Expansion
         ↓ large/open-ended phase
v3.x    Advanced MangaFlux
~~~

We are not rushing toward v2 or v3. The immediate target is **v1.1.1 — Reading Quality Refinements**, followed by whatever additional **v1.1.x** releases are justified before the Library & Reading Quality phase is declared complete.

---

## ✅ v1.0.0 — Stable V1 — COMPLETE

The original stable MangaFlux foundation:

- Mobile-first landing, dashboard, and discovery
- Autocomplete search
- Genres, rankings, and filters
- Complete chapter pagination/direct lookup
- Immersive manga reader
- Reading progress and resume
- Data Saver
- Chapter Jump
- Verified accounts
- Password recovery
- One active login session per account
- Bookmarks
- History / Continue Reading
- Avatars and public community profiles
- Reactions and comments
- Recommendations
- Admin operations
- Status and diagnostics
- Security/reliability foundation

---

## ➡️ v1.1.x — Library & Reading Quality — CURRENT

### ✅ v1.1.0 — Library + Reader Settings Foundation

Already completed and on `main`.

#### Library
- All / Bookmarks / History views
- Library title search
- Sort by recent activity
- Sort by title
- Sort by reading progress
- Larger persisted Library views
- Remove individual history entries
- Clear entire reading history
- Preserve bookmarks when clearing history
- Confirmation for destructive history actions

#### Reader Settings
- Per-series Reader Settings
- Preferred chapter language
- Per-series Data Saver
- Alternate-release visibility
- Browser-local preference persistence
- Global-setting fallback

#### Chapter quality
- Preferred language affects chapter lists
- Preferred language affects Previous/Next
- Preferred language affects Jump Chapter
- Duplicate chapter releases collapse automatically
- Scanlation-group attribution remains visible
- Alternate-release count
- Option to display every alternate release

#### UX
- Mobile Library controls
- Tablet Library controls
- Responsive Reader Settings
- Responsive chapter controls

---

### ➡️ v1.1.1 — Reading Quality Refinements — NEXT

This is the immediate development target.

#### Preference improvements
- Define safe account synchronization for reader preferences
- Keep browser-local preferences as fallback
- Avoid overwriting newer preference choices when synchronizing

#### Scanlation controls
- Better scanlation-group selection
- Optional preferred scanlation group per manga
- Better alternate-release selection
- Keep scanlation attribution clearly visible

#### Reader/chapter quality
- Remaining chapter-quality improvements building naturally on v1.1.0
- Fix/polish issues discovered from actual v1.1.0 testing
- Focused history-management improvements

#### Responsive QA
- Tablet testing
- Landscape testing
- Library QA
- Reader Settings QA
- Chapter-controls QA

**Scope rule:** do not put every remaining v1.1 feature into v1.1.1.

---

### v1.1.2+ — Remaining Reading Quality

Room remains for additional v1.1.x releases.

Possible work includes:

- Stronger per-series preferences
- Reader typography settings
- Reader spacing controls
- Image/reader fit preferences
- Additional history controls
- More reading-quality refinements based on real usage
- Accessibility fixes
- Regression fixes
- Final v1.1.x polish

Once the entire Library & Reading Quality phase is satisfactory, move forward to v1.2.x.

---

## v1.2.x — Profiles & Community Depth

Focus shifts from reading to MangaFlux's community system.

- Richer public profiles
- Optional profile bio
- User preferences
- Privacy controls
- Better activity browsing
- Improved activity/history display
- Better comment UX
- Better reaction UX
- Notification/privacy preference groundwork
- Stronger community administration
- More moderation/admin tools
- Keep credentials and private account information protected

---

## v1.3.x — Following & Notifications

Introduce a proper following system separate from bookmarks.

- Follow Manga
- Following independent from bookmark/read state
- New-chapter notifications
- Per-manga notification preferences
- Email notifications
- Notification inbox
- Notification history
- Optional Discord/webhook notifications
- Quiet controls
- Disable notification controls
- Notification rate limiting

---

## v1.4.x — Discovery & Personalization

Make discovery increasingly personalized.

- Better recommendation explanations
- Activity-based recommendations
- Saved discovery filters
- Recently viewed controls
- Search-history controls
- Stronger language preferences
- Genre preferences
- Manga-status preferences
- Better Hot discovery
- Better Popular discovery
- Better Trending discovery

---

## v1.5+ — Product Polish

Finish maturing MangaFlux V1 before changing its underlying source architecture.

- PWA/installability
- Faster application shell
- Accessibility improvements
- Performance improvements
- Offline-safe shell/state where appropriate
- Production hardening
- Scaling only when real traffic requires it
- Shared Redis/edge rate limiting only once MangaFlux actually needs multi-instance infrastructure

Then the major architectural evolution begins.

---

# v2.x — Multi-Source + Platform Expansion

This is intentionally a **large and expandable phase**.

v2 is not simply "add another manga source."

It gives MangaFlux room for:

~~~text
sources → architecture → identity → data → migration → adapters
        → operations → scaling → platform maturity
~~~

We can add **v2.7 → v2.8 → v2.9 → v2.10 → v2.11...** if necessary.

**Do not rush into v3.**

---

## v2.0.x — Source Platform Foundation

Build the architecture that allows MangaFlux to stop being tightly coupled to MangaDex.

- Source registry
- Source capability model
- Normalized manga contracts
- Normalized chapter contracts
- Normalized search contracts
- Source configuration
- Source health monitoring
- Attribution requirements
- Per-source caching policies
- Per-source rate policies
- Prefer official/public APIs
- HTML adapters only where explicitly permitted
- No CAPTCHA bypass
- No paywall bypass
- No login-wall bypass
- No anti-bot bypass

---

## v2.1.x — Unified Multi-Source Search

Actually expose multiple permitted sources through MangaFlux.

- Search multiple sources
- Normalize results
- Merge results
- Source badges
- Source-aware metadata
- Deterministic title matching
- Filter by source
- Preserve source attribution

---

## v2.2.x — Canonical Manga Identity & Deduplication

This solves a major multi-source problem: the same manga can appear on multiple sources.

MangaFlux gets its own canonical title identity.

- Canonical MangaFlux manga ID
- Map source editions to canonical titles
- Duplicate-candidate detection
- Confidence-based matching
- Admin/manual corrections
- Preserve source provenance
- Avoid duplicated Library titles

---

## v2.3.x — Source Selection & Safe Fallback

Readers gain control over where content comes from.

- Preferred source per manga
- Source availability awareness
- Safe source fallback
- Per-source language preferences
- Per-source quality preferences
- Explicit source switching
- Preserve attribution
- Never silently disguise the source

---

## v2.4.x — Cross-Source Library Migration & Provenance

Move existing MangaFlux data safely into the new architecture.

- Map MangaDex bookmarks to canonical MangaFlux titles
- Map reading progress
- Preserve original MangaDex references
- Migration confidence indicators
- Migration status UI
- Cross-source chapter reconciliation
- Cross-source progress reconciliation
- Repair bad mappings
- Roll back incorrect mappings

---

## v2.5.x — Adapter SDK & Testing

Make adding and maintaining permitted sources systematic.

- Source adapter fixtures
- Contract tests
- Source test harness
- Adapter documentation
- Internal adapter documentation
- Capability validation
- Compatibility checks
- Adapter version checks

---

## v2.6.x — Multi-Source Operations & Scale

Prepare the backend to operate the platform reliably.

- Source-specific diagnostics
- Source health
- Background jobs where needed
- Queues where justified
- Shared caching where justified
- Distributed rate limiting when multiple API instances actually exist
- Source incident controls
- Degraded-state handling
- Admin source controls
- Operational source controls

---

## v2.7+ — Platform Expansion & Maturity

Intentionally open-ended.

Possible future v2.x releases:

- Additional permitted sources
- Better migration tooling
- Improved canonical manga matching
- Source-quality signals
- Better availability detection
- Data architecture improvements
- Scaling architecture
- Platform security
- Source reliability
- Adapter improvements
- Operational tooling
- Multi-source UX improvements

If another major platform feature logically belongs here, create **v2.7.x, v2.8.x, v2.9.x, v2.10.x, v2.11.x...** rather than dumping it into v3.

---

# v3.x — Future / Advanced MangaFlux

Only after the multi-source/platform architecture has matured do we move here.

---

## v3.0.x — Semantic Discovery

Move beyond traditional title/genre searching.

- Metadata-assisted search
- Embedding-assisted search
- Natural-language manga discovery
- Semantic similarity
- Semantic recommendations
- Grounded explanations for recommendations

Example:

> "Find me a dark fantasy manga with a lonely protagonist but not an isekai."

---

## v3.1.x — Advanced Personalization

More sophisticated — but opt-in — personalization.

- Taste profile
- Custom reading lists
- Collections
- More-like-this
- Less-like-this
- Hide manga
- Hide genres
- Recommendation transparency
- Preference-history reset
- Preference-history deletion

---

## v3.2.x — Richer Social Features

Expand MangaFlux's community functionality carefully.

- Shareable lists
- Public lists
- Private lists
- Custom collections
- Activity controls
- Optional reader following
- Privacy controls
- Anti-abuse protections
- Stronger moderation
- Stronger admin tooling

---

## v3.3.x — Native / Flutter App

Potential MangaFlux mobile-client phase.

- Mature PWA first
- Possible Flutter application
- iOS
- Android
- Shared MangaFlux API
- Shared MangaFlux account
- Synchronized Library
- Synchronized progress
- Synchronized preferences
- Mobile notifications
- Accessibility parity

---

## v3.4+ — Platform/API Ecosystem

The longer-term MangaFlux platform.

- Documented API contracts
- User-owned data export
- Data import
- Richer analytics
- Platform operations
- Source/adapter developer ecosystem
- Additional integrations
- Experimental clients

v3.x remains expandable too, but we do not need to define everything years ahead.
