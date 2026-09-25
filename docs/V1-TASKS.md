# MangaFlux V1.x tasks

## Stable V1 baseline

- [x] mobile-first discovery/dashboard/search/genres
- [x] scalable chapter browsing
- [x] immersive reader + progress/resume
- [x] verified accounts + recovery
- [x] account-backed bookmarks/history/progress
- [x] community profiles/comments/reactions
- [x] recommendations
- [x] admin operations/status/diagnostics
- [x] reliability/security/release gates

## v1.1.0 — Library & Reader Settings Foundation

- [x] Library All / Bookmarks / History views
- [x] Library title filter
- [x] Library recent/title/progress sort
- [x] fetch up to 100 persisted Library records
- [x] remove one reading-history item
- [x] clear reading history without removing bookmarks
- [x] confirmation for history deletion
- [x] per-series reader preferences foundation
- [x] preferred chapter language
- [x] Reader Settings sheet
- [x] per-series Data Saver
- [x] alternate scanlation-release toggle
- [x] collapse duplicate chapter-number releases by default
- [x] keep scanlation-group attribution visible
- [x] mobile/tablet layout pass

## v1.1.1 — Reading Quality Refinements

- [x] safe account sync for per-series reader preferences
- [x] browser-local fallback with timestamp conflict protection
- [x] optional preferred scanlation group
- [x] preferred-group selection for collapsed duplicate releases
- [x] extended Reader Settings landscape QA

## v1.1.2 — Reader Layout Controls

- [x] per-series image-fit preference
- [x] Fit width and Fit screen reader modes
- [x] Seamless / Small / Large page spacing
- [x] account/local synchronization for reader layout preferences
- [x] migration defaults for existing reader-preference rows
- [x] quick Data Saver control uses the synchronized preference path

## v1.1.3 — History Cleanup & Accessibility

- [x] clear history older than 30 days
- [x] clear history older than 90 days
- [x] account/device support for age-based cleanup
- [x] preserve bookmarks and newer Continue Reading progress
- [x] safer destructive-dialog initial focus
- [x] confirmation-dialog keyboard focus trap
- [x] visible keyboard focus styling
- [x] reduced-motion CSS support

## v1.1.4 — Reader Typography & Accessibility

- [x] Small / Standard / Large reader UI text size
- [x] account/local synchronization for reader text size
- [x] migration default for existing reader-preference rows
- [x] Reader Settings keyboard focus trap
- [x] Reader Settings initial focus + focus restoration
- [x] explicit live reader-page status for assistive technology

## v1.1.5 — Reader Navigation & Resume Fixes

- [x] stabilize Continue Reading resume against delayed image layout
- [x] pause page tracking/progress writes during resume anchoring
- [x] eager-load pages through the saved resume target only
- [x] replace key-in Jump Chapter with a scrollable chapter list
- [x] highlight and center the currently reading chapter
- [x] load older chapters while scrolling the jump list
- [x] reader Back menu with Library / Discover more / Surprise me
- [x] similarity-based Surprise me roulette
- [x] reader Home explicitly opens the current manga page
- [x] visual press feedback with reduced-motion handling

## v1.1.x sign-off

- [x] physical-device regression sign-off accepted
- [x] Library & Reading Quality phase closed
- [x] move active development to v1.2 Profiles & Community Depth

## v1.2.0 — Profile Bio & Privacy Foundation

- [x] optional profile bio up to 280 characters
- [x] persist bio for signed-in accounts
- [x] show bio in public community profiles
- [x] per-account public-activity visibility control
- [x] hide public activity totals when activity privacy is disabled
- [x] hide recent public comments when activity privacy is disabled
- [x] keep email/private account data out of public profiles
- [x] move Library / Discover more / Surprise me to manga details
- [x] reader Back and Home both return to current manga

## v1.2.1 — Profile Editing & Mobile Modal Polish

- [x] read-only community profile by default
- [x] explicit Edit profile entry point
- [x] Save exits edit mode
- [x] Cancel discards unsaved profile drafts
- [x] preserve mobile page scroll while public profile modal is open
- [x] restore exact scroll position on modal close
- [x] restore originating comment focus without scrolling

## v1.2.2 — Activity Browsing & Discussion UX

- [x] paginated public-profile comment activity
- [x] enforce public-activity privacy on every activity page request
- [x] Newest / Oldest comment sorting
- [x] direction-aware discussion pagination
- [x] return new posts to Newest-first page one
- [x] recover pagination after deleting the final comment on a page
- [x] mark signed-in reader comments with You
- [x] show accessible total/selected reaction status

## v1.2.3 — Profile Privacy & Community Moderation

- [x] public joined-date visibility preference
- [x] omit hidden joined date from public profile API output
- [x] admin community restrict / restore control
- [x] block restricted accounts from posting comments
- [x] block restricted accounts from reactions
- [x] preserve reading/account/profile access while restricted
- [x] prevent active admin from self-restricting
- [x] show restriction state in account and admin UX

## v1.2.4 — Mobile Avatar Reliability & Admin Polish

- [x] fix valid mobile JPEG avatar selection failures
- [x] WebP-first avatar encoding with JPEG fallback
- [x] bounded additional compression fallbacks
- [x] validate WebP/JPEG signatures server-side
- [x] search recent admin users by display name/email
- [x] filter recent admin users by community state

## v1.2.5 — Notification Preference Groundwork

- [x] persisted Email notifications account preference
- [x] safe default for existing accounts
- [x] explicit Edit profile / Save / Cancel integration
- [x] return preference through session/profile APIs
- [x] keep actual notification delivery out of v1.2.x

## v1.2.x sign-off

- [x] physical QA for notification preference persistence
- [x] final community-depth regression pass
- [x] Profiles & Community Depth phase closed
- [x] move active development to v1.3 Following & Notifications

## v1.3.0 — Following Foundation

- [x] account-only Follow / Unfollow Manga
- [x] Following independent from bookmarks and reading progress
- [x] account-synced Following list
- [x] dedicated Following Library view/shelf
- [x] signed-out Follow prompt/state
- [x] per-follow notification flag foundation

## v1.3.1 — Per-Manga Notification Preferences

- [x] per-follow Alerts on / Alerts off preference
- [x] persist preference on existing follow row
- [x] manga-details notification control
- [x] Following Library notification control
- [x] new follows default to alerts enabled
- [x] keep notification generation/delivery out of v1.3.1

## v1.3.2 — Notification Event Foundation

- [x] durable new-chapter event schema
- [x] idempotent event uniqueness across retries
- [x] store manga/chapter/source publication metadata
- [x] reserve read-state timestamp for future inbox work
- [x] query only per-manga Alerts on follows as event-eligible
- [x] repository primitives for event creation/listing
- [x] keep polling/inbox/email delivery out of v1.3.2

## v1.3.3 — Controlled Notification Generation

- [x] per-user/per-manga notification checkpoint schema
- [x] seed first observation without generating historical alerts
- [x] generate one idempotent event when latest chapter changes
- [x] advance checkpoint after changed-chapter observation
- [x] check only per-manga Alerts on follows
- [x] fail-closed secret-protected internal checker
- [x] conservative checker rate limit and aggregate counters
- [x] keep inbox/email delivery out of v1.3.3

## v1.3.4 — Notification Inbox & History

- [x] authenticated notification history API
- [x] account-only Notifications Library view
- [x] unread count and visual state
- [x] individual persisted Mark read
- [x] opening an event marks it read
- [x] persisted Mark all read
- [x] chapter links from events
- [x] reuse v1.3.2 read_at without a new migration
- [x] keep email delivery out of v1.3.4

## v1.3.5 — Email Notification Delivery

- [x] integrate existing global Email notifications preference as delivery gate
- [x] require verified account email for new-chapter email delivery
- [x] preserve per-manga Alerts on as the event-generation gate
- [x] send new-chapter email through existing Resend transport
- [x] use event-stable email idempotency keys
- [x] expose aggregate sent / skipped / failed counters
- [x] preserve inbox event/checkpoint state when email delivery fails
- [x] reuse existing schema without a new migration

## v1.3.6 — Notification Delivery Safety

- [x] harden checker-to-email delivery path
- [x] retain global Email notifications as account disable control
- [x] retain verified-email and per-manga Alerts delivery gates
- [x] cap successful notification emails at 20 per checker invocation
- [x] expose emailRateLimited alongside sent / skipped / failed counters
- [x] preserve inbox/checkpoint state independently from delivery outcome
- [x] reuse existing schema without a new migration

## v1.3.7 — Notification Quiet Hours

- [x] persisted account quiet-hours toggle
- [x] configurable local start/end time
- [x] validate and persist IANA time zone
- [x] device time-zone helper in Account settings
- [x] support cross-midnight quiet windows
- [x] suppress email during quiet hours while preserving inbox events
- [x] expose emailQuietHours checker counter
- [x] add migration 0013 with safe disabled defaults

## v1.3.x — Following & Notifications — COMPLETE

- [x] physical QA signed off through v1.3.7
- [x] core following and notification delivery stable
- [x] Discord/webhook delivery deferred by product decision
- [x] close v1.3.x and advance to v1.4.x

## v1.4.0 — Recommendation Explanations

- [x] preserve recommendation ranking signals
- [x] explain matching creator signals
- [x] explain matching genre/theme signals
- [x] explain release-year signals
- [x] keep explanations grounded in actual discovery requests
- [x] preserve existing ranking/exclusion behavior
- [x] no new database migration
- [x] physical production QA signed off

## v1.4.1 — Activity-Based Recommendations

- [x] blend up to three recent reading/bookmark activity seeds
- [x] order activity seeds by persisted reading/bookmark timestamps
- [x] weight newer activity more strongly
- [x] deduplicate creator/genre/theme/year discovery signals across seeds
- [x] reinforce ranking when recent titles share the same signal
- [x] cap discovery work at eight ranked signals
- [x] tie recommendation explanations to contributing recent titles
- [x] preserve bookmark/history exclusions
- [x] no new database migration

## Remaining v1.4.x

- [ ] saved discovery filters
- [ ] recently viewed controls
- [ ] search-history controls
- [ ] stronger language/genre/status preferences
- [ ] improve Hot / Popular / Trending

## Future V1.x

- [ ] v1.5+ Product polish/PWA/performance
