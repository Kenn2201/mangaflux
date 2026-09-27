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

## Decision

No second reading source passes the v2.1.0 production gate today.

MangaFlux therefore keeps only MangaDex enabled and does not add a fake/unsafe adapter merely to advance the roadmap. v2.1.1 Unified Search remains blocked until a second permitted adapter exists.

## Re-entry gate

A candidate can reopen v2.1.0 implementation when its current upstream access, reader-page capability, attribution/terms, host policy, and operational behavior can be verified without bypass mechanisms.
