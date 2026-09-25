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

## Remaining v1.3.x

- [ ] per-manga notification preferences
- [ ] new-chapter notification event foundation
- [ ] notification inbox/history
- [ ] global email preference integration
- [ ] quiet/disable controls and rate limiting
- [ ] optional Discord/webhook delivery after core notifications stabilize

## Future V1.x

- [ ] v1.4 Discovery & Personalization
- [ ] v1.5+ Product polish/PWA/performance
