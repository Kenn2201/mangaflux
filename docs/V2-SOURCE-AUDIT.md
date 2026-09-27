# V2.1 Source Candidate Audit

Audited: 2026-09-27

This audit is the production gate for MangaFlux v2.1.0. A candidate is not approved merely because a public repository or endpoint exists.

## Requirements

A production reading adapter must have:
- independently identifiable upstream ownership/access;
- access compatible with MangaFlux's source policy;
- no CAPTCHA, paywall, login-wall, Cloudflare, anti-bot, or hotlink-protection bypass;
- stable identifiers;
- search and/or catalog metadata;
- chapter lists and reader page access when it is intended to solve chapter coverage;
- source-specific attribution, image-host, cache, rate, and health rules;
- an independently disableable adapter.

## Audit results

### MangaDex
Status: existing approved production source.

Official/public JSON API and existing MangaFlux adapter. Remains source #1.

### Manhwa Reader API
Status: not approved / identity not verified.

The roadmap candidate name could not be tied to a sufficiently authoritative, maintained API with independently verifiable access terms and reader-page behavior. MangaFlux will not install or execute an arbitrary similarly named repository to infer approval.

### ComicK
Status: metadata candidate only; not approved as source #2 reader adapter.

Current public evidence confirms ComicK remains useful as a manga/manhwa/webtoon database and has API activity. Current 2026 evidence also indicates ComicK itself no longer provides reading capability. Third-party projects that expose ComicK chapter pages rely on old/private page structures, scraping, referer spoofing, or proxy behavior. Those mechanisms do not pass MangaFlux's production-source policy.

ComicK may be reconsidered later for metadata/canonical matching, but v2.1.x needs a source that can genuinely improve chapter/page coverage.

### Third-party multi-source scraper APIs
Status: rejected for production source #2.

Repositories audited in this class expose HTML scraping, Cloudflare/anti-bot bypasses, referer spoofing, hotlink proxies, or other access workarounds. MangaFlux will not inherit those mechanisms through a wrapper API.

### Nyora
Status: conditional candidate; individual upstream/parser audit required.

Nyora exposes a broad parser-backed search/details/chapters/pages surface. Its JavaScript/TypeScript SDK maintenance status and aggregator design mean MangaFlux must not treat "Nyora" as one trusted upstream. Individual underlying sources require their own access/provenance audit before any parser is enabled. Nyora may be useful as an experimental integration mechanism only for sources that independently pass MangaFlux policy.

### MANGA Plus
Status: official-service candidate; not approved as general source #2.

MANGA Plus is an official Shueisha reading service and current clients demonstrate title/chapter/page access. However, the programmatic endpoints used by community clients are not presented as a documented public developer API, and free access is intentionally catalog/chapter limited. MangaFlux will not treat undocumented application endpoints as a general-purpose production API without a clearer supported integration contract.

### INKR
Status: rejected via third-party API wrapper.

INKR is an official comics service, but no documented public developer API was found. The structured API candidate is a third-party managed extraction service and does not establish official upstream API permission. Paid/locked chapters also expose only previews. It does not satisfy the source #2 gate.

### OmegaAPI
Status: experimental candidate only; not approved as a production coverage source.

OmegaAPI exposes a useful normalized search/details/chapters/pages REST surface, but it is third-party middleware over the OmegaScans API rather than an independently approved upstream. Its own documentation says the hosted instance is for testing only and may be paused because of request volume. MangaFlux will not make production reading depend on that hosted middleware without independently verifiable upstream access and operational terms.

## 2026-09-27 recheck after v2.1.2

v2.1.1 and v2.1.2 were completed safely without pretending a second provider exists: unified search, provenance, normalization, failure isolation, same-source duplicate suppression, and degraded-source UX are source-independent foundations.

A fresh candidate recheck still does not establish a production-safe second reader source. Newly surfaced multi-source/manhwa wrappers rely on scraping, image proxies, referer/header workarounds, or undocumented/internal upstream interfaces. Those mechanisms remain outside MangaFlux's source policy. MANGA Plus remains an official reading service, but MangaFlux still does not have a documented public developer integration contract suitable for treating it as a general production API.

## v2.1.3 coverage strategy

MangaFlux now distinguishes source roles:

- **primary** — preferred stable source for ordinary reading;
- **coverage** — approved additional source used to broaden title/chapter/regional availability;
- **experimental** — isolated candidate integration that must not be treated as reliable fallback until promoted.

Coverage is also declared by media family: Japanese manga, Korean manhwa, and Chinese manhua. A source can support more than one family. These declarations describe provider intent/capability; they do not assert that every title or chapter exists there.

This lets MangaFlux investigate useful fallback providers without weakening provenance. A missing chapter on MangaDex remains "missing from MangaDex," not "nonexistent everywhere." Actual cross-source identity and chapter reconciliation remain v2.2.x/v2.3.x work.

## Reliability classification and promotion gate

Provider roles are operational states, not marketing labels.

**Experimental → Coverage promotion requires:**
- independently verified upstream/access provenance still passes the source gate;
- advertised search/details/chapters/pages capabilities behave consistently for the capabilities MangaFlux enables;
- stable source and chapter identifiers;
- declared image hosts, cache policy, request pacing, and attribution are accurate;
- health checks can fail without breaking primary-source operation;
- no dependency on CAPTCHA, Cloudflare bypass, login/paywall bypass, referer spoofing, or other protected-access workarounds;
- physical QA across representative manga/manhwa/manhua titles relevant to that provider.

**Coverage → Experimental/disabled demotion is required when:**
- upstream ownership/access terms become unclear or materially change;
- the provider begins requiring protected-access bypasses;
- identifiers or reader-page behavior become persistently unstable;
- image hosts or operational policy change without a safe update path;
- repeated provider failures make fallback behavior misleading or unreliable.

A **critical** failure mode is reserved for sources whose outage should affect overall source-health status. **Isolated** providers report their own degradation without taking healthy critical providers down with them.

## Decision

No second reading source currently passes the production coverage gate.

MangaFlux therefore keeps only MangaDex enabled and does not add a fake/unsafe adapter merely to advance the roadmap. v2.1.3 therefore establishes the Regional Coverage Sources model without pretending an external adapter has passed. MangaDex remains the only enabled production reader source. Additional manga/manhwa/manhua adapters can enter as experimental or coverage candidates only after their individual upstream/access requirements are understood; real multi-source coverage QA remains gated on at least one approved reader-capable source.

## Re-entry gate

A candidate can reopen v2.1.0 implementation when its current upstream access, reader-page capability, attribution/terms, host policy, and operational behavior can be verified without bypass mechanisms.
