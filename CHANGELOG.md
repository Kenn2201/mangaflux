# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- v1.3.4+ notification inbox/history
- global Email notifications integration as a delivery gate
- quiet/disable controls and delivery rate limiting

## 1.3.3 - 2026-09-26 — Controlled Notification Generation

### Generation/checkpointing
- Added per-user/per-manga notification checkpoints.
- First observation seeds the current latest chapter and does not backfill a false "new" alert.
- A later latest-chapter change creates one idempotent new-chapter event and advances the checkpoint.
- Only followed manga with per-manga Alerts on are checked.
- Added a fail-closed internal check endpoint protected by NOTIFICATION_CRON_SECRET.
- Added conservative rate limiting and aggregate check counters.
- No inbox UI or email delivery is enabled yet.

## 1.3.2 - 2026-09-26 — Notification Event Foundation

### Event model
- Added durable notification_events storage for new-chapter events.
- Added user/source/manga/chapter/type uniqueness so retries cannot create duplicate events.
- Stored manga/chapter display metadata, source publication time, event creation time, and a future read timestamp.
- Added an eligible-follow query that excludes per-manga Alerts off rows.
- Added repository primitives for idempotent event creation and chronological event listing.
- No polling, user-visible inbox, or email delivery is enabled by this release.

## 1.3.1 - 2026-09-26 — Per-Manga Notification Preferences

### Following preferences
- Added Alerts on / Alerts off for each followed manga.
- Persisted the preference on the existing follow row.
- Added controls on manga details and the Following Library shelf.
- New follows default safely to alerts enabled.
- Kept per-manga alert eligibility separate from the account-level Email notifications delivery preference.
- No notification event is generated or delivered yet.

## 1.3.0 - 2026-09-26 — Following Foundation

### Following
- Added account-synced manga Following independent from bookmarks and reading progress.
- Added Follow / Following controls to manga details.
- Added a dedicated Following view and shelf in Library.
- Signed-out readers are asked to sign in before Following is available.
- Follow rows include a per-manga notification-enabled field for later v1.3.x notification work.

### Phase transition
- v1.2.x Profiles & Community Depth passed physical QA and is signed off.
- v1.3.x Following & Notifications is now the active phase.

## 1.2.5 - 2026-09-26 — Notification Preference Groundwork

### Notification/privacy groundwork
- Added a persisted Email notifications account preference.
- Existing accounts default safely to enabled.
- Preference is editable only through the explicit profile edit flow and respects Save/Cancel behavior.
- Session/profile responses return the saved preference so it persists across refresh/sign-in.
- No notification emails are sent by v1.2.5; actual following, notification generation, inbox, and delivery remain v1.3.x work.

## 1.2.4 - 2026-09-25 — Mobile Avatar Reliability & Admin Polish

### Mobile avatar reliability
- Fixed profile-photo selection failures seen on mobile Safari/iPhone for otherwise valid JPEG images.
- Avatar processing now attempts WebP and falls back to JPEG when browser WebP encoding is unavailable or unsuitable.
- Added smaller compression fallbacks while keeping strict upload-size limits.
- Server avatar validation now accepts WebP/JPEG and verifies their actual file signatures.

### Admin polish
- Added recent-user search by display name/email.
- Added Community active / Community restricted filtering.
- Existing restriction, restore, session-revoke, and comment-removal protections remain unchanged.

## 1.2.3 - 2026-09-25 — Profile Privacy & Community Moderation

### Profile privacy
- Added a Show joined date privacy control to community profile editing.
- Public profile responses omit the membership timestamp when joined-date visibility is disabled.
- Existing accounts default safely to joined-date visible.

### Community moderation
- Added an administrator control to restrict or restore a user's commenting and reaction access.
- Community restrictions are enforced by the API for both comment and reaction mutations.
- Restricted users can still sign in, read manga, manage their library, and edit their account/profile.
- Admin self-restriction is blocked.
- Admin overview shows whether each recent account has active or restricted community access.

### Restricted-account UX
- Discussion reaction controls are disabled for restricted accounts.
- Comment composer is replaced by a clear restriction notice.
- Account profile summary also reports an active community restriction.

## 1.2.2 - 2026-09-25 — Activity Browsing & Discussion UX

### Public profile activity
- Added a privacy-aware paginated public-profile activity endpoint.
- Public profiles can switch from Recent comments to full comment-history browsing.
- Activity pages expose only public comment metadata and continue to hide all account credentials/private data.
- Public-activity privacy is rechecked server-side for every paginated activity request.

### Discussion browsing
- Added Newest-first and Oldest-first comment sorting.
- Comment pagination labels follow the selected chronological direction.
- Posting a new comment returns the thread to Newest-first/page one so the new comment is visible immediately.
- Deleting the last comment on a page returns safely to the previous available page.

### Reaction/comment clarity
- Added a You marker to the signed-in reader's own comments.
- Added accessible reaction totals and selected-reaction status.
- Kept the existing verified-account, cooldown, ownership-delete, and privacy protections.

## 1.2.1 - 2026-09-25 — Profile Editing & Mobile Modal Polish

### Profile editing flow
- Community profile settings are now read-only until Edit profile is selected.
- Saving exits edit mode and returns to the saved read-only profile summary.
- Cancel restores the current saved profile and discards draft name, avatar, bio, and privacy changes.
- Preview profile remains available from the read-only profile state.

### Mobile public profile return
- Preserve the underlying page scroll position while a public profile modal is open.
- Restore the exact scroll position when the modal closes.
- Restore keyboard focus with preventScroll so mobile browsers do not jump away from the originating comment.

## 1.2.0 - 2026-09-25 — Profile Bio & Privacy Foundation

### Profiles
- Added optional public profile bios up to 280 characters.
- Added account editing and public-profile rendering for bios.
- Kept email and private account credentials out of public profile responses.

### Privacy
- Added a per-account Show public activity setting.
- When disabled, public profile activity totals and recent-comment history are withheld.
- Existing accounts safely default to public activity enabled.

### Reader navigation correction
- Moved Library, Discover more, and Surprise me from the immersive reader to the manga details page.
- Reader Back now returns directly to the current manga page.
- Reader Home continues to return directly to the current manga page.
- Surprise me continues to use similarity signals rather than unrestricted randomness.

## 1.1.5 - 2026-09-25 — Reader Navigation & Resume Fixes

### Continue Reading stability
- Reworked resume behavior so saved pages are anchored after preceding page images settle.
- Eager-load pages up to the saved resume target while keeping later pages lazy.
- Pause intersection-based page tracking and progress writes during resume anchoring.
- Release normal reader tracking only after the saved page is stable.

### Chapter navigation
- Replaced numeric key-in Jump Chapter with a scrollable chapter list.
- Highlight the current chapter as Reading now and center it when the list opens.
- Load toward the current chapter and fetch older chapters as the list is scrolled.

### Reader exit navigation
- Reader Back now opens Library, Discover more, and Surprise me choices.
- Surprise me reuses MangaFlux similarity signals such as genres/themes and creator where available.
- Reader Home continues to open the current manga page and is labeled accordingly.

### Interaction polish
- Added visual pressed-state feedback to common buttons, reader navigation, cards, and primary navigation.
- Reduced-motion users do not receive the scale press animation.

## 1.1.4 - 2026-09-25 — Reader Typography & Accessibility

### Reader typography
- Added per-series Small, Standard, and Large reader UI text-size options.
- Kept manga page artwork unchanged; the option affects reader chrome, labels, navigation, and status text only.
- Synchronized text size through the existing account/local preference model with timestamp conflict protection.
- Added a safe Standard default for existing account preference rows.

### Settings accessibility
- Reader Settings now traps keyboard focus while open.
- Reader Settings receives a predictable initial close-button focus and restores the previous focus after closing.
- Added an explicit live status for current reader page announcements.

## 1.1.3 - 2026-09-25 — History Cleanup & Accessibility

### History management
- Added reading-history cleanup for entries older than 30 or 90 days.
- Added server-side age cleanup for both browser/device identities and signed-in accounts.
- Preserved bookmarks and newer Continue Reading progress when clearing old history.
- Kept existing remove-one and clear-all history actions.

### Accessibility and regression polish
- Confirmation dialogs now initially focus Cancel for safer destructive actions.
- Trapped keyboard focus inside confirmation dialogs while they are open.
- Added visible focus treatment for keyboard navigation.
- Added reduced-motion CSS behavior for users who request it.

## 1.1.2 - 2026-09-25 — Reader Layout Controls

### Reader layout
- Added per-series image-fit controls with Fit width and Fit screen modes.
- Added Seamless, Small gap, and Large gap page-spacing options.
- Fit screen constrains manga pages to the current viewport height while preserving vertical reading.

### Preference persistence
- Extended account-synced reader preferences with image-fit and page-spacing values.
- Added safe migration defaults for existing preference rows.
- Kept browser-local fallback and timestamp conflict protection.
- Routed the immersive reader's quick Data Saver toggle through the same persisted/synchronized preference path.

### Development workflow
- Keep MangaFlux development on the persistent `kenn/develop` branch.
- Do not create temporary version/work branches for normal release work.
- Open one complete release PR from `kenn/develop` to `main`, merge only after CI passes, then reset `kenn/develop` to the merged `main` head.

## 1.1.1 - 2026-09-25 — Reading Quality Refinements

### Preference synchronization
- Added signed-in per-series reader preference synchronization.
- Kept browser-local preferences as the signed-out/offline fallback.
- Added timestamp conflict resolution so older device state cannot overwrite a newer preference choice.
- Added a dedicated persistence migration for account-backed reader preferences.

### Scanlation controls
- Added an optional preferred scanlation group per manga.
- Duplicate chapter releases now prefer the selected group when it is present.
- Scanlation attribution remains visible and all alternate releases can still be shown.

### Responsive QA
- Hardened Reader Settings for short landscape viewports.
- Kept broader typography, spacing, reader-fit, history, and accessibility work in v1.1.2+.

## 1.1.0 - 2026-09-25 — Library & Reader Settings Foundation

### Library
- Added All / Bookmarks / History library views.
- Added title filtering.
- Added recent/title/progress sorting.
- Expanded persisted summary retrieval from 12 to 100 bookmark/history records.
- Added remove-one reading-history action.
- Added clear-history action while preserving bookmarks.
- Added confirmation UX around history deletion.

### Reader settings
- Added a per-series reader settings sheet.
- Added preferred chapter language.
- Added per-series Data Saver preference.
- Added alternate-release visibility preference.
- Settings are browser-local in the v1.1.0 foundation and can fall back to global defaults.

### Chapters
- Manga chapter list uses preferred language.
- Reader previous/next chapter lookup uses preferred language.
- Jump Chapter uses preferred language.
- Duplicate releases for the same chapter number collapse by default.
- Scanlation group remains visible.
- Collapsed rows show the number of alternate releases.
- Readers can enable all alternate releases.

### Responsive UX
- Added dedicated tablet/mobile layouts for library controls, history actions, reader settings, and chapter controls.

## 1.0.0 - 2026-09-24 — Stable V1
## 0.9.1 - 2026-09-24 — RC UX & Account Hardening
## 0.9.0 - 2026-09-24 — V1 Release Candidate
## 0.8.3 - 2026-09-24 — Cache, Rate Limits & Performance Hardening
## 0.8.2 - 2026-09-24 — Diagnostics & Observability
## 0.8.1 - 2026-09-24 — Admin Operations
## 0.8.0 - 2026-09-24 — Reliability & Source Health
## 0.7.3 - 2026-09-24 — Recommendations
## 0.7.2 - 2026-09-24 — Community & Profiles
## 0.7.1 - 2026-09-24 — Chapter Scale & Reader Controls
## 0.7.0 - 2026-09-24 — Discovery & Dashboard
## 0.6.0 - 2026-09-24 — Mobile UX Foundation
## 0.5.1 - 2026-09-24 — Transactional Email
## 0.5.0 - 2026-09-24 — Authentication
## 0.4.0 - 2026-09-24 — Neon Persistence
## 0.3.0 - 2026-09-24 — Reader UX
## 0.2.1 - 2026-09-24 — Security Patch
## 0.2.0 - 2026-09-24 — Security Preview
## 0.1.0 - 2026-09-24 — Reader Prototype
