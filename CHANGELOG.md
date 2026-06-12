# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Uniform API error mapping** (consumer-visible): all services now share one
  canonical HTTP error handler (`src/utils/api.ts`). HTTP 400 responses return
  `error.code = 'VALIDATION_ERROR'` (message prefix `Bad request:`) and HTTP 503
  responses return `error.code = 'SERVICE_UNAVAILABLE'` (message prefix
  `Service unavailable:`) across **all** resources. Previously most services
  returned `API_ERROR` for these statuses; only `layouts` mapped 400 and only
  `media`/`feeds` mapped 503. Error message prefixes are now consistent for all
  statuses (`Authentication failed:`, `Access denied:`, `Not found:`,
  `Rate limited:`, `API error:`). Applications that switch on `error.code` or
  match `error.message` strings for 400/503 responses must be updated.
- `initEenToolkit({ debug: true })` now enables debug logging as documented
  (previously only the `VITE_DEBUG` environment variable had any effect).
- SSE connections from `connectToEventSubscription` now report status
  `'disconnected'` when the server closes the stream; the connection does not
  auto-reconnect (the previous JSDoc claim was incorrect).

### Security

- Excluded `examples/**/.env` and `examples/**/.auth-state.json` from the
  published npm package and added a secret-file guard to `verify-package.sh`.
- Debug logs now redact query strings from media session and SSE URLs.

## [0.3.0] - 2026-01-04

### Added

- **Marp Presentation Generation**: Added infrastructure to generate HTML presentations from markdown templates using Marp CLI
  - New `build:presentation` npm script
  - `scripts/generate-presentation.cjs` for template processing with dynamic repo URL injection
  - `scripts/PRESENTATION_TEMPLATE.md` with comprehensive toolkit overview slides
- Generated presentation files (`PRESENTATION.md`, `PRESENTATION.html`) are excluded from version control

### Changed

- Updated build script to use `npx @marp-team/marp-cli` for consistent execution

## [0.2.0] - 2026-01-02

### Breaking Changes

- **Pinia 3.0 Required**: The peer dependency for Pinia has been updated from `^2.0.0 || ^3.0.0` to `^3.0.0`. Applications using Pinia 2.x must upgrade to Pinia 3.x before updating to this version.

### Changed

- Migrated ESLint configuration from v8 to v9 with flat config format
- Updated all example applications to use Pinia 3.0
- Improved E2E test reliability with self-contained test files
- Added configurable base URL support in E2E tests

### Added

- E2E testing documentation in README
- JSDoc comments for E2E test helper functions
- Error logging in E2E tests for local debugging (suppressed in CI)

### Updated Dependencies

- `eslint`: 8.56.0 → 9.39.2
- `@typescript-eslint/eslint-plugin`: 6.21.0 → 8.51.0
- `@typescript-eslint/parser`: 6.21.0 → 8.51.0
- `eslint-plugin-vue`: 9.20.0 → 10.6.2
- `pinia`: 2.1.7 → 3.0.4
- `@types/node`: 22.0.0 → 25.0.3
- `@vue/tsconfig`: 0.5.0 → 0.8.1
- Added `globals` package for ESLint 9 compatibility
