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

## Remaining v1.2.x

- [ ] richer activity browsing and presentation
- [ ] better comment UX
- [ ] better reaction UX
- [ ] broader user/privacy preferences
- [ ] notification/privacy preference groundwork
- [ ] stronger community moderation/admin tools

## Future V1.x

- [ ] v1.3 Following & Notifications
- [ ] v1.4 Discovery & Personalization
- [ ] v1.5+ Product polish/PWA/performance
