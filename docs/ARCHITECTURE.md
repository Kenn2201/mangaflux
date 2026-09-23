# Architecture

MangaFlux separates the website from source acquisition.

1. The Next.js frontend requests normalized data from the MangaFlux API.
2. The API selects a registered source adapter.
3. The adapter uses `fetchSource()` for normal HTTPS/JSON/HTML requests.
4. `browserSource()` exists for legitimate browser-required integrations, but is intentionally not the default.
5. The adapter converts source-specific responses into shared MangaFlux types.
6. Neon stores user-owned state and cache metadata, not mirrored manga pages.

## Source contract

Every adapter implements:

- `search(query)`
- `details(id)`
- `chapters(id)`
- `pages(chapterId)`

## Security baseline

- HTTPS only
- Explicit host allowlists
- Request timeout
- Response-size limit
- No arbitrary remote code execution
- No credentials embedded in source adapters
- No CAPTCHA/paywall/login/anti-bot bypass logic
