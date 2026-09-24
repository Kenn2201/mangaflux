# MangaFlux V1 Release Candidate Checklist

This is the manual production checklist for v0.9.x. CI verifies code/build/security invariants, but the items below require real production testing before v1.0.0.

## 1. Deployment / infrastructure

- [ ] `https://api.manga.kenncode.me/health` reports v0.9.0.
- [ ] persistence/auth/email/admin are configured.
- [ ] `https://manga.kenncode.me/status` reports expected component state.
- [ ] Render cold start recovers normally.
- [ ] cron wake check still uses lightweight `/health`.
- [ ] Vercel production deployment is on the same main commit as Render.

## 2. Anonymous product flow

- [ ] Landing page works on iPhone Safari.
- [ ] Header autocomplete works with keyboard arrows + Enter + Escape.
- [ ] Search results work.
- [ ] Genres bottom sheet opens/closes and Browse More Genres works.
- [ ] Hot / Popular / Top Rated / Latest Updates load.
- [ ] Show All pagination works.
- [ ] year/status/author/artist/tag filters work.
- [ ] manga details and related/recommendation rails load.

## 3. Chapter / reader

- [ ] a manga with 300+ chapters can reach old chapters.
- [ ] newest/oldest sorting works.
- [ ] direct chapter lookup works.
- [ ] reader loads all pages.
- [ ] Page X / Y and persistent progress meter stay correct.
- [ ] tap-to-show/hide chrome works.
- [ ] hidden reader chrome is not keyboard-focusable.
- [ ] Previous / Chapters / Next controls work.
- [ ] scroll-to-top works.
- [ ] Data Saver persists.
- [ ] failed image retry works.
- [ ] Continue Reading resumes near the saved page.

## 4. Authentication / recovery

- [ ] new account creation sends verification email.
- [ ] unverified login is blocked.
- [ ] verification link succeeds once.
- [ ] verified login succeeds.
- [ ] logout clears session.
- [ ] forgot-password response remains generic.
- [ ] reset link succeeds once and revokes old sessions.
- [ ] account page never flashes signed-out UI before session resolution.

## 5. Profiles / community

- [ ] display-name update persists.
- [ ] JPEG/PNG/WebP avatar upload persists.
- [ ] public comments do not show email.
- [ ] manga reactions work.
- [ ] chapter reactions work.
- [ ] comments require a verified account.
- [ ] one-comment-per-five-minutes cooldown is enforced by the API.
- [ ] own-comment delete works.
- [ ] comment pagination works.

## 6. Admin

- [ ] non-admin account receives no admin card.
- [ ] direct non-admin `/admin` access is denied by API authorization.
- [ ] configured verified admin sees Admin Console.
- [ ] overview counters load.
- [ ] diagnostics load.
- [ ] comment removal works.
- [ ] revoke another user's sessions works.
- [ ] current admin self-revoke remains blocked.
- [ ] no passwords, password hashes, raw tokens, secrets, or SQL controls are exposed.

## 7. Accessibility

- [ ] Skip to main content appears on keyboard focus.
- [ ] mobile navigation announces current page.
- [ ] header search behaves as an accessible combobox/listbox.
- [ ] genre browser announces as a modal dialog and returns focus to trigger.
- [ ] all important controls are keyboard reachable.
- [ ] visible keyboard focus is not clipped or hidden.
- [ ] VoiceOver can identify Home, Browse, Library, Account and reader controls.
- [ ] reduced-motion preference suppresses nonessential motion.
- [ ] text remains usable at 200% zoom.
- [ ] 320px / 390px / 430px mobile widths do not overflow horizontally.

## 8. Security / cache behavior

- [ ] secret scan passes.
- [ ] migration journal check passes.
- [ ] release-invariant check passes.
- [ ] dependency audit has no high-severity finding.
- [ ] private auth/account/state/community/admin responses are no-store.
- [ ] public source data may use the documented shared cache policy.
- [ ] 429 responses include Retry-After and RateLimit policy information.
- [ ] admin authorization remains server-side.
- [ ] no secret is stored in a NEXT_PUBLIC variable.
- [ ] direct source fetching remains HTTPS + host-allowlisted.

## 9. Responsive regression

- [ ] iPhone Safari.
- [ ] iPhone landscape.
- [ ] tablet-sized viewport.
- [ ] desktop Chrome/Edge/Safari-class viewport.
- [ ] bottom navigation does not cover actionable content.
- [ ] reader safe-area behavior works around iPhone home indicator/notch.

## 10. Release gate

v1.0.0 should not be tagged until:

- [ ] all blocking v0.9 findings are resolved.
- [ ] production smoke test passes after the final merge.
- [ ] merged temporary `kenn/*` branches are cleaned up.
- [ ] README / CHANGELOG / VERSIONING / ROADMAP agree on v1.0.0.
- [ ] v1.0.0 release tag is created from the audited production commit.
