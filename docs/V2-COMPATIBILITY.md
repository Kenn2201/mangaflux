# V2 Source Compatibility Contract

MangaFlux v2.0.x introduces source-aware platform infrastructure without rewriting or invalidating V1 data.

## V1 guarantees

- `mangadex` remains the default source when legacy requests omit a source.
- Existing MangaDex manga and chapter UUIDs remain valid.
- Existing MangaDex detail, related, chapter, page, and image URLs remain valid because the source-aware routes accept `mangadex` at the same path positions.
- Existing bookmark, history/progress, follow, notification, community, discovery, and reader behavior must remain functional.
- Existing database rows using `source=mangadex` are not rewritten.
- No v2.0.x database migration is required.
- Reader-preference persistence remains MangaDex-scoped in v2.0.x because the V1 table is keyed by manga ID only. It will not be generalized until a schema-safe migration is justified.

## Source contract

Every enabled source must declare capabilities, discovery kinds, languages, attribution, image hosts, cache policy, request policy, and identifier validators before it can be dispatched.

Unsupported operations fail explicitly. MangaFlux must not silently emulate a missing capability.

Protected-access bypasses are forbidden by source policy. A future adapter may not bypass CAPTCHA, paywalls, login walls, or anti-bot controls.

## v2.0.5 gate

Before source #2 is enabled, physical production QA must confirm the V1 surfaces above still work. Source #2 remains disabled until that gate passes.
