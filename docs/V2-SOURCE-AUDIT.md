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
Status: rejected as production source #2.

Nyora exposes a complete typed search/details/chapters/pages flow across hundreds of parser-backed sources, but its JavaScript/TypeScript SDK is explicitly marked "No Longer Maintained". It is an aggregator/parser layer rather than one independently approved upstream content source. That fails the v2.1 production reliability/provenance gate.

### MANGA Plus
Status: official-service candidate; not approved as general source #2.

MANGA Plus is an official Shueisha reading service and current clients demonstrate title/chapter/page access. However, the programmatic endpoints used by community clients are not presented as a documented public developer API, and free access is intentionally catalog/chapter limited. MangaFlux will not treat undocumented application endpoints as a general-purpose production API without a clearer supported integration contract.

### INKR
Status: rejected via third-party API wrapper.

INKR is an official comics service, but no documented public developer API was found. The structured API candidate is a third-party managed extraction service and does not establish official upstream API permission. Paid/locked chapters also expose only previews. It does not satisfy the source #2 gate.

### OmegaAPI
Status: not approved for production.

OmegaAPI exposes a useful normalized search/details/chapters/pages REST surface, but it is third-party middleware over the OmegaScans API rather than an independently approved upstream. Its own documentation says the hosted instance is for testing only and may be paused because of request volume. MangaFlux will not make production reading depend on that hosted middleware without independently verifiable upstream access and operational terms.

## 2026-09-27 recheck after v2.1.2

v2.1.1 and v2.1.2 were completed safely without pretending a second provider exists: unified search, provenance, normalization, failure isolation, same-source duplicate suppression, and degraded-source UX are source-independent foundations.

A fresh candidate recheck still does not establish a production-safe second reader source. Newly surfaced multi-source/manhwa wrappers rely on scraping, image proxies, referer/header workarounds, or undocumented/internal upstream interfaces. Those mechanisms remain outside MangaFlux's source policy. MANGA Plus remains an official reading service, but MangaFlux still does not have a documented public developer integration contract suitable for treating it as a general production API.

## Decision

No second reading source currently passes the production gate.

MangaFlux therefore keeps only MangaDex enabled and does not add a fake/unsafe adapter merely to advance the roadmap. v2.1.3 Manhwa Coverage is blocked at the source gate because its core deliverable requires a real permitted manhwa reader adapter. This is a source-approval blocker, not a code-architecture blocker.

## Re-entry gate

A candidate can reopen v2.1.0 implementation when its current upstream access, reader-page capability, attribution/terms, host policy, and operational behavior can be verified without bypass mechanisms.
