# MangaFlux Roadmap

This is the canonical MangaFlux roadmap.

## Where we are right now

~~~text
v1.x     ████████████████████  ✅ COMPLETE
v2.0.x   ████████████████████  ✅ SOURCE PLATFORM FOUNDATION
v2.1.0   ████████████████████  ✅ PHYSICAL QA SIGNED OFF
v2.1.1   ████████████████████  ✅ PHYSICAL QA SIGNED OFF
v2.1.2   ████████████████████  ✅ PHYSICAL QA SIGNED OFF
v2.1.3   ████████████████████  ✅ PHYSICAL QA SIGNED OFF
v2.1.4   ████████████████████  ✅ PHYSICAL QA SIGNED OFF
v2.1.5   ████████████████████  ✅ IMPLEMENTED ACCOUNT/AUTH QA SIGNED OFF
                                   ↳ cross-provider coverage QA remains BLOCKED AT SOURCE GATE
v2.1.6   ████████████████████  🟡 IMPLEMENTED — SOURCE QUALIFICATION / QA PENDING
v2.2.x   ░░░░░░░░░░░░░░░░░░░░  Canonical Manga Identity & Deduplication
v2.3.x   ░░░░░░░░░░░░░░░░░░░░  Missing-title/chapter fallback + explicit source selection
v2.4+    ░░░░░░░░░░░░░░░░░░░░  Library migration, SDK, operations, explicit-source isolation
~~~

**Current release:** v2.1.6 implements the source-qualification layer. v2.1.5's Account/Auth scope is physically QA signed off. MangaDex remains the only enabled production reader source; candidate APIs are now represented separately with explicit pass/fail/unverified checks and blockers.

**v2.1.6 gate:** MangaPDF is the strongest newly documented candidate because it advertises a public developer API and complete reader path, but its advertised API hosts timed out during the live probe. Manhwa Reader returned HTTP 500 and Nyora remains maintenance/provenance-blocked. No candidate is enabled merely to advance the roadmap. Physical QA for v2.1.6 validates the qualification API and MangaDex regression behavior; real Source B reader QA remains blocked until a candidate's live reader path passes.

**Fallback goal:** once a second reader source is qualified, v2.2.x maps the same work across providers and v2.3.x compares chapter coverage so MangaFlux can find missing titles/chapters from approved sources while always preserving provenance and never silently splicing unrelated editions.

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

## ✅ v1.1.x — Library & Reading Quality — COMPLETE

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

### ✅ v1.1.4 — Reader Typography & Accessibility

#### Reader typography
- Per-series Small / Standard / Large reader UI text
- Reader chrome, labels, status text, and navigation respond to the selected size
- Manga page artwork remains unchanged
- Text size uses account synchronization and browser-local fallback
- Existing account rows default safely to Standard

#### Settings accessibility
- Reader Settings keyboard focus trap
- Predictable initial focus and focus restoration
- Explicit live reader-page status for assistive technology

---

### ✅ v1.1.5 — Reader Navigation & Resume Fixes

#### Resume stability
- Keep Continue Reading anchored to the saved page while preceding manga images settle
- Eager-load only the pages needed to reach the saved position
- Pause page observation/progress writes during the resume handoff
- Return to normal reader tracking after the saved page is stable

#### Chapter jump
- Replace chapter-number key-in with a scrollable chapter list
- Highlight and center the current chapter as Reading now
- Continue loading older chapters while scrolling

#### Reader navigation
- Back menu: Library / Discover more / Surprise me
- Surprise me uses similarity signals instead of unrestricted randomness
- Home icon opens the current manga page

#### Interaction polish
- Visual pressed-state feedback for primary controls/cards/navigation
- Reduced-motion-safe press behavior

---

The v1.1.x reading-quality phase is complete. Regression-only fixes can still be patched if discovered, but new work now belongs to later roadmap phases.

---

## ✅ v1.2.x — Profiles & Community Depth — COMPLETE

### ✅ v1.2.0 — Profile Bio & Privacy Foundation

#### Richer identity
- Optional public profile bio
- Bio editing from the account page
- Bio rendering in community profile previews
- Public profile output continues to exclude email and private credentials

#### Privacy foundation
- Per-account Show public activity control
- Hide comment/reaction totals from the public profile when disabled
- Hide recent public-comment history from the public profile when disabled
- Existing accounts default safely to visible activity

#### Navigation correction carried with the minor transition
- Library / Discover more / Surprise me live on the manga details page
- Reader Back returns to the current manga page
- Reader Home returns to the current manga page

### ✅ v1.2.1 — Profile Editing & Mobile Modal Polish

#### Profile editing
- Community profile is read-only by default
- Explicit Edit profile action enters editing mode
- Save exits editing mode and returns to saved profile summary
- Cancel discards drafts and restores saved values

#### Mobile profile modal
- Preserve exact page scroll while the public-profile modal is open
- Restore scroll position when closing
- Restore originating control focus without causing a scroll jump

---

### ✅ v1.2.2 — Activity Browsing & Discussion UX

#### Public activity browsing
- Paginated public-profile comment history beyond the recent preview
- Server-side privacy check on every activity page request
- Newer / Older navigation inside the public profile modal
- Public activity continues to exclude email and private account data

#### Discussion UX
- Newest / Oldest comment sorting
- Direction-aware comment pagination labels
- New posts return to Newest-first page one
- Deleting the final comment on a page safely moves to the prior page
- Signed-in reader's own comments are marked You

#### Reaction clarity
- Total reaction summary
- Selected reaction summary for signed-in readers
- Accessible live status around reaction changes

---

### ✅ v1.2.3 — Profile Privacy & Community Moderation

#### Profile privacy
- Show / hide joined date on public community profiles
- Hide the timestamp at the server response layer, not only in CSS
- Existing accounts default safely to joined date visible

#### Community moderation
- Admin can restrict or restore community posting/reactions per account
- Restriction keeps reading, library, authentication, and profile management available
- API enforcement covers both comment and reaction mutations
- Admin cannot restrict the currently active admin account
- Admin account list exposes community-active / restricted state

#### Restricted-account UX
- Restricted users see a clear account notice
- Reaction controls are disabled
- Comment composer is replaced with a restriction explanation

---

### ✅ v1.2.4 — Mobile Avatar Reliability & Admin Polish

#### Mobile avatar reliability
- WebP-first avatar encoding with JPEG fallback for mobile browser compatibility
- Additional bounded compression sizes/qualities for difficult images
- Server validation of actual WebP/JPEG signatures
- Existing avatar byte and request limits remain enforced

#### Admin polish
- Search recent accounts by display name/email
- Filter recent accounts by community active/restricted state
- Existing restriction/restore and admin self-protection remain unchanged

---

### ✅ v1.2.5 — Notification Preference Groundwork

#### Account preference
- Persist a per-account Email notifications preference
- Existing accounts default safely to enabled
- Preference uses the existing explicit Edit profile / Save / Cancel workflow
- Saved state is returned through authenticated session/profile responses

#### Phase boundary
- v1.2.5 stores preference only
- No notification email is generated or delivered yet
- Following, per-manga preferences, inbox/history, quiet controls, and delivery remain v1.3.x

---

### ✅ v1.2.x — Physical QA Sign-off

- Notification preference persistence passed
- Profile/privacy/community features passed
- Mobile avatar reliability passed
- Moderation restriction/restore behavior passed
- Discussion/activity regressions passed
- Profiles & Community Depth phase closed

---

## ➡️ v1.3.x — Following & Notifications — CURRENT

Introduce a proper following system separate from bookmarks.

### ✅ v1.3.0 — Following Foundation

- Account-only Follow / Unfollow Manga
- Following independent from bookmarks and reading progress
- Account-synced Following shelf in Library
- Dedicated Following Library view
- Signed-out readers are prompted to sign in
- Follow rows carry a notification-enabled field for later v1.3.x controls

### ✅ v1.3.1 — Per-Manga Notification Preferences

- Alerts on / Alerts off for each followed manga
- Persist preference on the follow record
- Controls on manga details and the Following Library shelf
- New follows default safely to alerts enabled
- Per-manga alert eligibility remains separate from the global Email notifications delivery gate
- No chapter notification is generated or delivered yet

### ✅ v1.3.2 — Notification Event Foundation

- Durable new-chapter notification event storage
- Idempotent user/source/manga/chapter/type event identity
- Manga/chapter metadata and source publication timestamp retained
- Future read-state timestamp reserved
- Eligible-follow query respects per-manga Alerts on/off
- Repository primitives for event creation and chronological listing
- No polling job, inbox UI, or delivery side effects yet

### ✅ v1.3.3 — Controlled Notification Generation

- Per-user/per-manga latest-chapter checkpoints
- First observation seeds state without historical notification spam
- Later latest-chapter changes create idempotent new-chapter events
- Checkpoints advance after a successful changed-chapter observation
- Only per-manga Alerts on follows participate
- Internal checker is fail-closed behind NOTIFICATION_CRON_SECRET
- Conservative checker rate limiting and aggregate counters
- No inbox UI or email delivery yet

### ✅ v1.3.4 — Notification Inbox & History

- Account-only notification history API
- Notifications view in Library
- Unread count and unread visual state
- Individual Mark read persistence
- Opening an event marks it read
- Mark all read persistence
- Chapter links from generated events
- No new migration; uses the read_at field reserved in v1.3.2
- No email delivery yet

### ✅ v1.3.5 — Email Notification Delivery

- New chapter events use the existing transactional Resend transport
- Global Email notifications preference gates delivery
- Verified account email is required
- Per-manga Alerts on remains the event-generation gate
- Event-stable email idempotency key
- Aggregate sent / skipped / failed delivery counters
- Inbox/checkpoint state remains durable when email delivery fails
- No new database migration

### ✅ v1.3.6 — Notification Delivery Safety

- Hardened checker-to-email delivery for newly created chapter events
- Existing global Email notifications switch remains the account disable control
- Verified email and per-manga Alerts remain required gates
- Maximum 20 successful notification emails per checker invocation
- Excess eligible deliveries reported through emailRateLimited
- Sent / skipped / failed / rate-limited aggregate counters
- Durable inbox/checkpoint state remains independent from delivery outcome
- No new database migration

### ✅ v1.3.7 — Notification Quiet Hours

- Persisted account-level quiet-hours toggle
- Configurable local start/end time
- IANA time-zone persistence and validation
- Device time-zone helper in Account settings
- Cross-midnight quiet windows
- Email suppressed during quiet hours while inbox events remain durable
- emailQuietHours checker counter
- Migration 0013 with quiet hours disabled by default for existing accounts

### ✅ v1.3.x — Following & Notifications — COMPLETE

Physical QA is signed off through v1.3.7. Core following, per-manga alerts, durable notification events, inbox/history, email delivery, delivery safety, and quiet hours are complete.

Discord/webhook delivery is intentionally deferred and is not required to close this phase.

---

## ➡️ v1.4.x — Discovery & Personalization — CURRENT

Make discovery increasingly personalized.

### ✅ v1.4.0 — Recommendation Explanations — QA SIGNED OFF

- Preserve the actual creator, genre/theme, and year signals used by dashboard recommendation ranking
- Show concise per-title explanations for why each recommendation appeared
- Keep explanations grounded in real discovery signals rather than generated guesses
- Preserve existing ranking and already-read/library exclusion behavior
- Physical production QA passed
- No new database migration

### ✅ v1.4.1 — Activity-Based Recommendations — QA SIGNED OFF

- Blend up to three recent reading/bookmark activity seeds
- Rank recent activity more strongly than older activity
- Deduplicate repeated creator, genre/theme, and year signals across seeds
- Let shared signals reinforce recommendation ranking
- Cap discovery work at eight ranked signals to keep upstream requests bounded
- Tie explanation text back to the recent title that contributed each signal
- Preserve existing bookmark/history exclusions
- Physical production QA passed
- No new database migration

### ✅ v1.4.2 — Saved Discovery Filters — QA SIGNED OFF

- Save up to five discovery filter presets on the current device
- Preserve sort, genre, status, year, and creator context in each preset
- Reapply a saved preset in one tap
- Remove saved presets independently
- Reject duplicate presets and enforce the five-preset limit
- Label saved presets clearly as device-local
- Preserve URL-based Browse filtering and pagination
- Physical production QA passed
- No new database migration

### ✅ v1.4.3 — Recently Viewed Controls — QA SIGNED OFF

- Record successful manga-detail views separately from reading progress
- Keep the 12 most recent unique manga on the current device
- Move a reopened manga back to the front instead of duplicating it
- Show Recently viewed shelves on Home and Dashboard when history exists
- Remove one recently viewed manga
- Clear the full recently viewed list
- Keep bookmarks, reading history, Following, and account data untouched
- Physical production QA passed
- No new database migration

### ✅ v1.4.4 — Search History Controls — QA SIGNED OFF

- Remember up to 10 unique explicit search terms on the current device
- Record submitted searches, selected search suggestions, and visited results queries
- Do not store ordinary autocomplete keystrokes
- Move repeated searches to the front instead of duplicating them
- Show recent searches when the header search is focused and empty
- Re-run, remove one, or clear all recent searches
- Keep search history separate from Recently viewed, reading history, and account data
- Physical production QA passed
- No new database migration

### ✅ v1.4.5 — Discovery Language Preference — QA SIGNED OFF

- Replace English-only discovery chapter availability with a validated language preference
- Store the discovery language on the current device
- Reuse MangaFlux's supported reader-language set
- Apply the preference to Home/Dashboard Hot, Popular, Top, and Latest discovery
- Apply the preference to Browse and discovery-driven recommendation surfaces
- Apply the preference to Surprise me
- Keep discovery language separate from per-series reader chapter language
- Include language in MangaDex discovery cache keys
- Physical production QA passed
- No new database migration

### ✅ v1.4.6 — Genre Preferences — QA SIGNED OFF

- Choose up to three explicit preferred genres on the current device
- Keep genre preferences separate from saved Browse filter presets
- Add and remove preferred genres independently
- Clear all genre preferences
- Build a dedicated preferred-genre recommendation rail
- Merge duplicate manga across preferred-genre discovery groups
- Rank explicit preferences while preserving normal global discovery rankings
- Respect the current Discovery language
- Physical production QA passed
- No new database migration

### ✅ v1.4.7 — Personalization Depth — QA SIGNED OFF

- Add an optional device-local manga-status preference
- Apply preferred status to Hot, Popular, Trending, and preferred-genre recommendations
- Improve Hot as a freshness-led popularity blend
- Improve Popular with follow popularity dominant and bounded freshness reinforcement
- Add first-class Trending discovery based on popularity + recent chapter activity overlap
- Add Trending to Home/Dashboard and Browse
- Keep Top rated and Latest available as global reference rankings
- Keep language, genre, status, and saved-filter preferences independent
- No new database migration
- Physical production QA passed
- v1.4.x Discovery & Personalization is complete

---

## 🧪 v1.5.0 — Product Polish — CURRENT / CONSOLIDATED QA TARGET

Finish maturing MangaFlux V1 before changing its underlying source architecture.

- Installable PWA manifest and app identity
- Same-origin service worker with conservative static-shell caching
- Offline-safe fallback without caching private API/state or reader traffic
- Live online/offline status feedback
- Faster route shell with loading state
- Recoverable application error state
- Dedicated not-found state
- Keyboard-focus restoration after route navigation
- Existing focus-visible and reduced-motion accessibility retained
- Off-screen rendering containment for major content surfaces
- Explicit service-worker/offline/icon cache policies
- Existing security headers, diagnostics, cache controls, and bounded rate limits retained
- Shared Redis/edge rate limiting assessed and deferred until real multi-instance traffic requires shared counters
- No new database migration
- After physical QA passes, v1.5.0 closes the planned V1 Product Polish phase and v2.x becomes next

---

# v2.x — Multi-Source + Platform Expansion

This is intentionally a **large and expandable phase**. The repository inspection after v1.5.0 confirmed that V1 already stores `source` beside manga IDs in core library/progress/follow/notification records and already exposes normalized `MangaSource` contracts. The remaining coupling is primarily source dispatch, MangaDex-only validation, routes/URLs, cover-host policy, reader preferences, UI labels, and operations.

The safe migration path is therefore incremental:

~~~text
existing source-aware V1 data
→ source registry + capabilities + dispatch
→ second permitted source
→ unified search
→ canonical identity/dedup
→ source selection/fallback
→ library migration/reconciliation
→ adapter SDK
→ operations/scale
~~~

MangaDex remains the default/only enabled production source until another source is explicitly implemented and validated. Existing MangaDex IDs and user data must remain valid throughout v2.

---

## ➡️ v2.0.x — Source Platform Foundation — CURRENT

Build the source abstraction without changing current MangaDex user behavior.

### ✅ v2.0.0 — Source Registry & Identity Contracts — PHYSICAL QA SIGNED OFF
- Add a central source registry instead of importing/dispatching MangaDex directly
- Define stable source IDs and source descriptors
- Define source-aware manga and chapter references
- Keep existing MangaDex IDs backward compatible
- Add registry lookup/validation helpers
- Replace new MangaDex-only source validation with registry-backed validation where safe
- Keep MangaDex as the only enabled source
- No user-facing second source yet

### ✅ v2.0.1 — Source Capability Model — PHYSICAL QA SIGNED OFF
- Declare capabilities per source: search, discovery, tags, details, related titles, chapters, pages, health
- Declare supported discovery kinds
- Declare language/content capabilities where relevant
- Fail explicitly when a source does not support an operation
- Never silently pretend capabilities exist

### ✅ v2.0.2 — Source-Aware API Dispatch — PHYSICAL QA SIGNED OFF
- Route source operations through the registry
- Make search/details/chapters/pages/health dispatch source-aware
- Preserve backward-compatible MangaDex routes during migration
- Introduce source-aware request/response contracts without breaking V1 clients
- Remove direct MangaDex assumptions from shared dispatch paths

### ✅ v2.0.3 — Source Policy & Attribution — PHYSICAL QA SIGNED OFF
- Per-source attribution metadata
- Per-source allowed image/content hosts
- Per-source caching policy
- Per-source request/rate policy
- Prefer official/public APIs
- HTML adapters only where explicitly permitted
- No CAPTCHA, paywall, login-wall, or anti-bot bypass
- Surface the real source instead of disguising it

### ✅ v2.0.4 — Source Health & Diagnostics — PHYSICAL QA SIGNED OFF
- Registry-wide source health model
- Per-source latency/status
- Capability-aware diagnostics
- Admin/status visibility
- Degraded/unavailable source states
- Preserve MangaDex diagnostics and cache statistics

### ✅ v2.0.5 — V1 Compatibility Gate — PHYSICAL QA SIGNED OFF
- Regression-test bookmarks, history, progress, follows, notifications, reader preferences, community, discovery, and reader
- Verify existing `source=mangadex` records require no destructive rewrite
- Verify existing MangaDex URLs/IDs remain usable
- Document compatibility guarantees before enabling source #2

---

## v2.1.x — Multi-Source Discovery & Regional Coverage

The goal is not merely to add another API. MangaFlux must eventually distinguish "this provider lacks the title/chapter" from "the title/chapter does not exist," while preserving provenance and never silently substituting sources.

### ✅ v2.1.0 — Source Candidate Audit — PHYSICAL QA SIGNED OFF
- Established source ownership/upstream, maintenance, access, reader-page, attribution, host, rate, and security gates
- Candidate directories and GitHub topic pages are discovery pools, not automatic approval
- Keep adapters independently disableable
- Do not bypass CAPTCHA, Cloudflare, paywalls, login walls, anti-bot systems, or hotlink protection

### ✅ v2.1.1 — Unified Search Foundation — PHYSICAL QA SIGNED OFF
- Fan out search across enabled general-content sources
- Normalize shared contracts and preserve provenance
- Isolate source failures
- Source badges/filter and deterministic round-robin ordering

### ✅ v2.1.2 — Multi-Source Search Quality — PHYSICAL QA SIGNED OFF
- Unicode-aware title/alternate-title normalization
- Conservative same-source duplicate suppression
- Per-source latency and degraded-source UX
- Healthy sources remain usable when another source fails
- No database migration

### ✅ v2.1.3 — Regional Coverage Sources — PHYSICAL QA SIGNED OFF
- Model provider roles explicitly: primary, coverage, experimental
- Model regional/content coverage explicitly: manga, manhwa, manhua
- Keep MangaDex as the primary enabled production source
- Audit and add additional Japanese manga, Korean manhwa, and Chinese manhua adapters individually
- Coverage/experimental providers must preserve their real source identity
- Do not enable an unverified adapter merely to increase source count
- Explicit/adult sources remain isolated for v2.7.x
- No database migration

### ✅ v2.1.4 — Provider Reliability & Coverage Classification — PHYSICAL QA SIGNED OFF
- Surface provider role and media coverage through status and source contracts
- Track capabilities, health, latency, failure mode, image hosts, cache policy, and request pacing
- Mark providers as critical or isolated for health aggregation
- Isolate failed provider health probes from the full status endpoint
- Keep experimental providers out of ordinary unified search unless explicitly requested
- Render enabled providers dynamically on the status page with role, media coverage, latency, and health
- Define promotion/demotion criteria between experimental and coverage roles
- Keep MangaDex as the only enabled production source
- No database migration

### ➡️ v2.1.5 — Coverage Gate & Real Multi-Source QA — PARTIALLY IMPLEMENTED / PHYSICAL QA PENDING
- Revalidate the production source gate before claiming real multi-source coverage
- MangaDex remains the only approved reader-capable production source; cross-provider coverage QA is BLOCKED AT SOURCE GATE
- Preserve the QA matrix for titles absent from MangaDex, incomplete chapter feeds, manga/manhwa/manhua, provider capability differences, and degraded-provider behavior
- Do not fabricate a second provider or weaken access/provenance policy merely to close v2.1.x
- Add header profile menu: Account / Library / Sign out
- Remove duplicate Account-page sign-out action
- Synchronize sign-in/sign-out state immediately across the persistent app shell and client navigation
- No database migration
- v2.1.x remains open until at least one real additional reader source is safely enabled and the coverage QA matrix can actually run

---

## v2.2.x — Canonical Manga Identity & Deduplication

Only introduce canonical identity after real cross-source data exists so matching rules are based on observed data rather than guesses.

### v2.2.0 — Canonical Identity Schema
- MangaFlux canonical manga ID
- Source-edition mapping table
- Provenance and mapping timestamps
- Existing MangaDex IDs remain resolvable

### v2.2.1 — Duplicate Candidate Detection
- Normalized title and alternate-title matching
- Creator/year/language metadata signals where available
- Confidence-based candidate generation
- Never auto-merge ambiguous titles

### v2.2.2 — Mapping Review & Corrections
- Admin/manual mapping correction
- Merge/split correction workflow
- Audit provenance
- Safe rollback of incorrect mappings

### v2.2.3 — Canonical Product Surfaces
- Canonical manga detail identity
- Source editions shown explicitly
- Avoid duplicate Library titles
- Preserve source-specific chapter provenance

---

## v2.3.x — Source Selection, Coverage & Safe Fallback

- Show chapter coverage per mapped source/edition
- Make missing/older chapter availability discoverable when another verified source covers it
- Preferred source per canonical manga
- Explicit source switching
- Availability-aware source selector
- Safe fallback only to mapped editions
- Per-source language preferences where supported
- Per-source quality preferences where meaningful
- Preserve attribution on every reader path
- Never silently disguise or substitute a source
- Never claim chapter equivalence without reconciliation
- Never silently splice chapter feeds from titles that merely have similar names

---

## v2.4.x — Cross-Source Library Migration & Provenance

- Map existing MangaDex bookmarks to canonical titles
- Map follows and notification state
- Map reading history/progress
- Preserve original MangaDex references
- Migration confidence/status UI
- Cross-source chapter reconciliation
- Cross-source progress reconciliation
- Repair incorrect mappings
- Roll back mappings safely
- Idempotent migrations and explicit migration journal entries

---

## v2.5.x — Reader History Visibility & Adapter SDK

### v2.5.0 — Read-State UX
- Show the user's last-read chapter on manga detail pages
- Visually mark chapters already read
- Use approximately 80% opacity as a secondary visual treatment without relying on opacity alone
- Add an explicit accessible Read indicator/state
- Carry read-state context into reader chapter navigation where useful
- Keep progress source-aware so editions are not accidentally conflated
- Preserve existing resume/progress behavior

### v2.5.1+ — Adapter SDK & Testing

- Adapter fixtures
- Contract tests
- Source test harness
- Capability validation
- Compatibility checks
- Adapter version checks
- Failure/timeout fixtures
- Attribution-policy tests
- Host-allowlist tests
- Internal adapter documentation
- Contributor/developer adapter documentation

---

## v2.6.x — Multi-Source Operations & Scale

- Source-specific diagnostics
- Source health history where justified
- Background jobs where required
- Queues only when justified by workload
- Shared caching when multiple instances require it
- Distributed rate limiting when multiple API instances actually exist
- Source incident controls
- Per-source disable/degraded controls
- Admin operational controls
- Observability for adapter latency/error rates
- Safe partial-platform operation when one source fails

---

## v2.7.x — Adult/Explicit Source Isolation

Adult-content sources are never mixed silently into ordinary MangaFlux discovery.

### v2.7.0 — Explicit Content Architecture
- Separate explicit/adult source capability from normal manga/manhwa sources
- Explicit opt-in boundary before adult-source discovery
- Clear source/content labeling
- Keep adult results out of normal search/discovery by default
- Source-specific policy, host, cache, and health controls
- Do not infer age from ordinary MangaFlux profile data

### v2.7.1 — nHentai Candidate Audit
- Evaluate the documented nHentai API as an adult-source candidate
- Verify current API behavior, access expectations, attribution, rate behavior, image hosts, and maintenance before implementation
- Do not integrate unofficial bypasses or anti-bot workarounds
- Only proceed to an adapter if the source passes the same production-source audit

### v2.7.2+ — Explicit Source Adapter & UX
- If approved, implement nHentai through the same registry/capability system
- Keep its catalog/search surfaces isolated from default MangaFlux manga/manhwa discovery
- Preserve explicit provenance and content labeling
- Independently disable the adapter without affecting normal MangaFlux

---

## v2.8+ — Platform Expansion & Maturity

Intentionally open-ended. Add v2.8.x, v2.9.x, v2.10.x and beyond as real platform requirements emerge.

Potential work:
- Additional permitted sources
- Better migration tooling
- Improved canonical matching
- Source-quality signals
- Better availability detection
- Data architecture improvements
- Scaling architecture
- Platform security
- Source reliability
- Adapter improvements
- Operational tooling
- Multi-source UX improvements
- Cross-source discovery improvements

**Do not rush into v3.** v2 remains the home for source/platform architecture until it is mature.

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
