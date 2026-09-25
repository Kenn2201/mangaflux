# MangaFlux Roadmap

This is the canonical MangaFlux roadmap.

## Where we are right now

~~~text
v1.0.0  ████████████████████  ✅
v1.1.0  ████████████████████  ✅
v1.1.1  ████████████████████  ✅
v1.1.2  ████████████████████  ✅
v1.1.3  ████████████████████  ✅
v1.1.4+ ░░░░░░░░░░░░░░░░░░░░  ← NEXT
v1.2.x  Profiles & Community
v1.3.x  Following & Notifications
v1.4.x  Discovery & Personalization
v1.5+   Product Polish
         ↓
v2.x    Multi-Source + Platform Expansion
         ↓ large/open-ended phase
v3.x    Advanced MangaFlux
~~~

We are not rushing toward v2 or v3. **v1.1.3 — History Cleanup & Accessibility is complete.** The immediate target remains inside **v1.1.x — Library & Reading Quality**, with **v1.1.4+** reserved for typography decisions, final accessibility/regression work, and final reading-quality QA.

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

### ✅ v1.1.1 — Reading Quality Refinements

#### Preference synchronization
- Safe account synchronization for per-series reader preferences
- Browser-local fallback for signed-out/offline use
- Timestamp conflict protection so older choices cannot overwrite newer settings

#### Scanlation controls
- Optional preferred scanlation group per manga
- Preferred-group selection when duplicate chapter releases are collapsed
- Scanlation attribution remains visible
- Alternate-release visibility remains available

#### Responsive QA
- Reader Settings hardening for short landscape viewports
- Reader/chapter regression pass around the v1.1.0 foundation

---

### ✅ v1.1.2 — Reader Layout Controls

#### Layout preferences
- Per-series image-fit preference
- **Fit width** keeps the existing continuous full-width reader behavior
- **Fit screen** keeps each page inside the current viewport height while preserving vertical reading
- Page spacing options: **Seamless**, **Small gap**, and **Large gap**

#### Preference persistence
- Image fit and page spacing use the existing account-synced preference model
- Browser-local fallback remains available
- Existing account rows migrate safely to Fit width + Seamless
- Timestamp conflict protection continues to apply

#### Reader consistency
- The quick Data Saver control now uses the same timestamped local/account sync path as Reader Settings instead of bypassing preference synchronization

---

### ✅ v1.1.3 — History Cleanup & Accessibility

#### History management
- Clear reading history older than 30 days
- Clear reading history older than 90 days
- Age cleanup works for browser/device identities and signed-in accounts
- Preserve bookmarks and newer Continue Reading progress
- Keep remove-one and clear-all actions

#### Accessibility
- Safer initial focus for destructive confirmation dialogs
- Keyboard focus trap inside confirmation dialogs
- Visible keyboard focus styling
- Reduced-motion CSS support

---

### ➡️ v1.1.4+ — Remaining Reading Quality — NEXT

Keep the remaining v1.1.x work focused instead of rushing to v1.2.

Possible work includes:

- Reader typography refinements if actual usage justifies them
- Additional accessibility fixes discovered through physical testing
- Regression fixes discovered through physical device testing
- Final Library/reader QA
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
