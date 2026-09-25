# MangaFlux Roadmap

This is the canonical MangaFlux roadmap.

## Where we are right now

~~~text
v1.0.0  ████████████████████  ✅
v1.1.0  ████████████████████  ✅
v1.1.1  ████████████████████  ✅
v1.1.2  ████████████████████  ✅
v1.1.3  ████████████████████  ✅
v1.1.4  ████████████████████  ✅
v1.1.5  ████████████████████  ✅
v1.2.0  ████████████████████  ✅
v1.2.1  ████████████████████  ✅
v1.2.2  ████████████████████  ✅
v1.2.3  ████████████████████  ✅
v1.2.4  ████████████████████  ✅
v1.2.5  ████████████████████  ✅
v1.3.0  ████████████████████  ✅
v1.3.1  ████████████████████  ✅
v1.3.2  ████████████████████  ✅
v1.3.3  ████████████████████  ✅
v1.3.4  ████████████████████  ✅
v1.3.5  ████████████████████  ✅
v1.3.6  ████████████████████  ✅
v1.3.7  ████████████████████  ✅
v1.3.8+ ░░░░░░░░░░░░░░░░░░░░  ← NEXT
v1.3.x  Following & Notifications
v1.4.x  Discovery & Personalization
v1.5+   Product Polish
         ↓
v2.x    Multi-Source + Platform Expansion
         ↓ large/open-ended phase
v3.x    Advanced MangaFlux
~~~

**v1.1.x — Library & Reading Quality** and **v1.2.x — Profiles & Community Depth** are signed off after physical QA. MangaFlux is now in **v1.3.x — Following & Notifications**. **v1.3.7 — Notification Quiet Hours** is complete, and v1.3.8+ remains available for notification delivery maturity before the project advances to v1.4.x Discovery & Personalization.

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

### ➡️ v1.3.8+ — Notification Delivery Maturity — NEXT

Keep this slot focused and optional:

- observe the core notification pipeline after quiet-hours QA
- add external Discord/webhook delivery only if still justified
- otherwise close v1.3.x and advance to v1.4.x Discovery & Personalization

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
