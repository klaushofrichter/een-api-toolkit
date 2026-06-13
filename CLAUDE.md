# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library ("Toolkit") implementing the Eagle Eye Networks (EEN) Video platform API v3.0 for use with Vue 3 Composition API applications. The library is published to npm as `een-api-toolkit`.

**Security and robustness are critical priorities for this toolkit.** As a library handling authentication tokens and API communication for video surveillance systems, code must be written defensively with proper error handling, input validation, and secure coding practices.

## Technology Stack

- **Build**: Vite + npm
- **Language**: TypeScript (strict mode)
- **HTTP Client**: Native fetch
- **State Management**: Pinia (for auth state)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Linting**: ESLint only (no Prettier)
- **Node.js**: Minimum version 20 LTS
- **TypeScript**: Pinned to ~5.8.x (required for API Extractor compatibility in vite-plugin-dts)
- **Dependencies**: Always use latest stable versions of imported packages

## Common Commands

```bash
npm run build              # Build library (ES + CJS + rolled-up .d.ts via vite-plugin-dts)
npm test                   # Run all unit tests once (Vitest)
npm run test:watch         # Vitest watch mode
npx vitest run src/__tests__/users.service.test.ts   # Run a single test file
npx vitest run -t "pattern"                          # Run tests matching a name
npm run lint               # ESLint on src/
npm run lint:fix           # ESLint with auto-fix
npm run typecheck          # vue-tsc --noEmit
npm run test:e2e           # Playwright E2E tests (see requirements below)
npm run test:e2e:ui        # Playwright UI mode
npm run test:e2e:examples  # Run E2E tests for all example apps
npm run docs               # Generate TypeDoc API docs + AI context docs
npm run verify-package     # Verify the built package contents
```

### Unit Tests
All unit tests live in `src/__tests__/` (not co-located with source), one file per service: `<resource>.service.test.ts`.

### E2E Tests
Located in `e2e/`, run serially (`workers: 1`) against the live EEN API. Requirements:
- `.env` with `TEST_USER`, `TEST_PASSWORD`, `VITE_EEN_CLIENT_ID`, `VITE_PROXY_URL` (see `.env.example`)
- Local OAuth proxy running on port 8787: `./scripts/restart-proxy.sh`

`e2e/auth-helper.ts` performs OAuth login once via a headless browser and caches the access token in `e2e/.auth-state.json` (gitignored, mode 0600) for reuse across test files. Clean up with `./scripts/cleanup-auth.sh`.

## AI Documentation & Agents

### AI Reference Documentation
The `docs/AI-CONTEXT.md` file is the entry point for AI assistants. It links to domain-specific documents in `docs/ai-reference/` for context-efficient assistance:
- `AI-SETUP.md` - Vue 3 app scaffolding, Pinia, Vite
- `AI-AUTH.md` - OAuth flow, tokens, route guards
- `AI-USERS.md` - User management API
- `AI-DEVICES.md` - Cameras & Bridges API
- `AI-MEDIA.md` - Media, Feeds, Live Video, HLS
- `AI-EVENTS.md` - Events, Alerts, Metrics, SSE
- `AI-GROUPING.md` - Layouts (camera groupings) API
- `AI-AUTOMATIONS.md` - Automation rules and actions
- `AI-JOBS.md` - Jobs, Exports, Files, Downloads
- `AI-PTZ.md` - PTZ camera controls (pan/tilt/zoom, presets)
- `AI-EVENT-DATA-SCHEMAS.md` - Event type to data schema mappings

### Specialized Agents
Domain-specific agents are available in `.claude/agents/`:
| Agent | Use Case |
|-------|----------|
| `een-setup-agent` | New Vue 3 projects, Pinia errors, redirect URI issues |
| `een-auth-agent` | OAuth login/logout, callbacks, route guards |
| `een-users-agent` | User listing, profiles, permissions |
| `een-devices-agent` | Cameras, bridges, status filtering |
| `een-media-agent` | Live video, previews, HLS, recorded images |
| `een-events-agent` | Events, alerts, metrics, SSE subscriptions |
| `een-grouping-agent` | Layouts, camera groupings, pane management |
| `een-automations-agent` | Alert rules, action rules, event conditions |
| `een-jobs-agent` | Jobs, exports, files, downloads |
| `een-ptz-agent` | PTZ camera controls, presets, click-to-center |

**Using Agents in Your Project:**

After installing `een-api-toolkit`, run:
```bash
npx een-setup-agents
```

This copies agents to `.claude/agents/` where Claude Code discovers them automatically. Each agent specifies which documentation files to load and its capabilities.

### Generation Scripts
```bash
npm run docs:ai-context          # Generate split files (default)
npm run docs:ai-context:single   # Generate legacy single file
```

## Architecture

### Source Structure (`./src/`)
Organized by resource (mirrors EEN API structure). Each resource directory follows the same shape: `service.ts` (plain async API functions) + `index.ts` (re-exports).
```
src/
├── auth/                 # Pinia store (store.ts) + OAuth service (login, refresh, logout)
├── users/                # Users API
├── bridges/              # Bridges API
├── cameras/              # Cameras API (includes camera settings)
├── events/               # Events API + dataSchemas.ts (event type → data schema map)
├── eventSubscriptions/   # Real-time SSE event subscriptions
├── eventMetrics/         # Event metrics (for charting)
├── alerts/               # Alerts API
├── notifications/        # Notifications API
├── automations/          # Automation rules (alert conditions/actions)
├── feeds/                # Feeds API (live video URLs)
├── media/                # Media API (recorded images, HLS)
├── layouts/              # Layouts (camera groupings)
├── jobs/                 # Async jobs
├── exports/              # Video exports
├── files/                # Files API
├── downloads/            # Downloads API
├── ptz/                  # PTZ controls (position, presets, settings)
├── types/                # Shared TypeScript types
├── utils/                # Debug logging, storage, timestamps, etc.
├── __tests__/            # All Vitest unit tests
├── config.ts             # Toolkit configuration
└── index.ts              # Single entry point export
```

### Key Patterns
- **API Style**: Plain async functions - `getUsers()`, `getCameras()`, `getUser()`, `getCamera()` - familiar, easy to test
- **Authentication**: Pinia store exported for direct use (`useAuthStore()`)
- **Error Handling**: Return `{data, error}` result objects, never throw exceptions
- **Types**: Hand-written per resource in `src/types/`, modeled on the EEN OpenAPI spec
- **Pagination**: Follow EEN API's native pagination approach
- **Data Fetching**: On demand only
- **Logging**: Debug mode via `VITE_DEBUG=true` environment variable
- **Caching**: None built-in (consuming apps handle if needed)

### Configuration
- **Proxy URL**: Via environment variable (`VITE_PROXY_URL` in `.env`)
- Uses OAuth via proxy server from `../een-oauth-proxy`

### Package Export
Single entry point:
```typescript
// Plain async functions
import { getUsers, getUser, getCameras, getCamera, getCurrentUser } from 'een-api-toolkit'

// Auth store and helpers
import { useAuthStore, initEenToolkit, getAuthUrl, handleAuthCallback } from 'een-api-toolkit'

// Types
import type { User, Camera, EenError, Result } from 'een-api-toolkit'
```

## API Implementation Policy

Only implement non-destructive GET and POST APIs until explicitly instructed to add PUT, DELETE, or PATCH. (Existing exceptions like PTZ position/settings were explicitly approved.)

## API Reference

- EEN API 3.0 spec: https://github.com/EENCloud/VMS-Developer-Portal
- Developer portal: https://developer.eagleeyenetworks.com/reference/using-the-api

## Reference Implementations

### OAuth Proxy (`../een-oauth-proxy`)
- **Proxy server**: Cloudflare Worker handling OAuth token management
- **Demo app**: `../een-oauth-proxy/demo1` - Vue 3 app with working auth flow
- **Key services to replicate**:
  - `demo1/src/services/auth.js` - OAuth flow (getAuthUrl, getAccessToken, refreshToken, revokeToken)
  - `demo1/src/services/proxy.js` - Proxy URL management
  - `demo1/src/services/user.js` - Example API service pattern
  - `demo1/src/stores/auth.js` - Pinia auth store pattern

### EEN Login App (`../een-login/src/services`)
- Rich examples of EEN API service implementations
- Patterns for cameras, sensors, feeds, media, measurements
- Security service with URL validation and input sanitization

## EEN API Patterns

### Base URL
The `httpsBaseUrl` from OAuth response varies by region (e.g., `c001.eagleeyenetworks.com`). Store in auth state.

### API Endpoints (Initial Focus)
```
GET  /api/v3.0/users/self          # Current user profile
GET  /api/v3.0/users               # List users
GET  /api/v3.0/bridges             # List bridges
GET  /api/v3.0/bridges/{id}        # Get bridge by ID
GET  /api/v3.0/cameras             # List cameras
GET  /api/v3.0/cameras/{id}        # Get camera by ID
POST /api/v3.0/cameras             # Create camera (later)
GET  /api/v3.0/cameras/{id}/ptz/position   # Get PTZ position
PUT  /api/v3.0/cameras/{id}/ptz/position   # Move PTZ camera
GET  /api/v3.0/cameras/{id}/ptz/settings   # Get PTZ settings
PATCH /api/v3.0/cameras/{id}/ptz/settings  # Update PTZ settings
```

### Pagination Pattern
EEN API uses cursor-based pagination:
- `pageSize` - Number of results per page
- `pageToken` - Cursor for next page (from previous response)
- Response includes `nextPageToken` if more results exist

### Filter Patterns
OData-style query parameters:
- Array filters: `id__in=id1,id2`, `tags__contains=tag1`
- Range filters: `timestamp__gte=2024-01-01`, `timestamp__lte=2024-12-31`
- Equality: `status__eq=online`, `status__ne=offline`
- Text search: `q=searchterm`

### Request Pattern
```typescript
const response = await fetch(`${baseUrl}/api/v3.0/resource?${params}`, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
```

## Service Method Template

```typescript
async function getResource(params?: ResourceParams): Promise<Result<Resource[]>> {
  // 1. Get auth state
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    return { data: null, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } }
  }

  // 2. Build URL with query params
  const queryParams = new URLSearchParams()
  if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize))
  if (params?.pageToken) queryParams.append('pageToken', params.pageToken)

  const url = `${authStore.baseUrl}/api/v3.0/resource?${queryParams}`

  // 3. Make request
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return { data: null, error: { code: 'API_ERROR', message: `HTTP ${response.status}` } }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { code: 'NETWORK_ERROR', message: String(err) } }
  }
}
```

## Auth Store Pattern (from ../een-oauth-proxy/demo1)

Key state:
- `token` - Access token (short-lived, validity configurable from 15 min to 7 days)
- `tokenExpiration` - Timestamp when token expires
- `refreshTokenMarker` - Indicates refresh token exists (actual token stored server-side)
- `sessionId` - For header-based auth fallback
- `hostname` / `port` - EEN API base URL components
- `baseUrl` - Computed from hostname + port

Auto-refresh: Trigger at 5 minutes before expiration OR 50% of token lifetime (whichever is earlier).

## Security Model

### Refresh Token Isolation
The refresh token is **never exposed to the client application**. This is a critical security design:

1. **Proxy stores refresh token** - Kept in Cloudflare KV, never sent to client
2. **Client receives session ID** - Used to identify the session with the proxy
3. **Token refresh flow**:
   - App calls `POST /proxy/refreshAccessToken` with session ID (via cookie or Authorization header)
   - Proxy retrieves stored refresh token from KV
   - Proxy exchanges refresh token for new access token with EEN
   - Proxy returns only the new access token to the app
4. **Client stores only**:
   - `token` - Short-lived access token
   - `sessionId` - Session identifier
   - `refreshTokenMarker` - Just `"present"` to indicate a refresh token exists

This prevents refresh token theft via XSS or browser storage inspection.

## Demo Applications

### In-repo examples (`/examples`)
Simple example apps for testing during development.

### External demo (`../een-api-toolkit-demo1`)
Isolated Vue 3 app that imports `een-api-toolkit` via npm. Use this to verify the published package works correctly with 100% isolation from the toolkit source.

### Common requirements
- Port 3333 on IP 127.0.0.1 (not "localhost")
- Launch scripts should kill existing process on port 3333: `kill $(lsof -ti :3333) 2>/dev/null || true`
- Requires running proxy server from `../een-oauth-proxy`

## Branch Strategy

- `develop`: integration testing branch
- `production`: release branch for well-tested packages
- Feature branches merge into `develop` before going to `production`
- Version number tracked in `./package.json`
- Husky auto-increments patch version on commit; minor/major updated manually

### Branch Sync Best Practices

**After merging a PR to production**, the develop branch must be synced to include the merge commit. This is automated via `.github/workflows/sync-develop.yml`, but if working locally:

```bash
# Before creating a new branch or making commits
git fetch origin
git merge origin/production

# Or if on a feature branch, rebase on updated develop
git fetch origin
git rebase origin/develop
```

**Why this matters**: GitHub's "Create a merge commit" option creates a new commit on production. If develop doesn't have this commit, PRs from develop will show "branch is out-of-date" and may be blocked by branch protection (`strict: true`).

## Husky Setup

Pre-commit hook auto-increments patch version when source files or package documentation changes:
```bash
# Install husky (done via npm prepare script)
npm install

# Hook location: .husky/pre-commit
# Triggers on: src/**/*, e2e/**/*, README.md, docs/AI-CONTEXT.md
# Runs: npm version patch --no-git-tag-version
# Then stages updated package.json and package-lock.json
```

Root package.json must include:
```json
{
  "scripts": {
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7"
  }
}
```

## GitHub Actions Workflows

Located in `.github/workflows/`.

### Code Review (`claude-code-review.yml`)
- Triggers on PR open/synchronize
- Uses `anthropics/claude-code-action@v1`
- Reviews code quality, bugs, performance, security
- Posts review as PR comment

### Branch Sync (`sync-develop.yml`)
- Triggers when PR is merged to production
- Automatically merges production into develop
- Keeps branches in sync after releases

### Test Release (`test-release.yml`)
- Triggers when PR is merged to production, or manually
- Runs linting, type checking, unit tests
- Builds and verifies package
- On success, triggers the publish workflow

### npm Publish (`npm-publish.yml`)
- Triggers when test-release workflow succeeds, or manually
- Generates CHANGELOG for the current release from merged PRs and commits
- Publishes to npm registry
- Creates GitHub Release with tarball and RELEASE-NOTES asset
- Sends Slack notifications on success (with links to npm, GitHub Release, and Release Notes) or on failure
- Supports dry-run mode for testing

### Validate PR (`validate-pr.yml`)
- Triggers on PRs to production
- Validates version consistency, runs lint/tests/build
- Dynamically discovers and runs E2E tests for all example apps (requires `playwright.config.ts` in the example directory)

### CodeQL Analysis (`codeql.yml`)
- Triggers on PRs to production and manually
- Runs GitHub CodeQL security analysis for JavaScript/TypeScript

### GitHub Actions SHA Pinning
All actions are pinned to immutable commit SHAs to prevent supply chain attacks. When Dependabot proposes an action update:
1. Verify the new SHA matches the expected release tag
2. Update the version comment (e.g., `# v6.0.2`) to match the new version
3. Review the action's release notes for breaking changes

**Exception**: `anthropics/claude-code-action` uses the `@v1` floating tag instead of a pinned SHA. This is intentional because:
- It is an official Anthropic action with trusted releases
- SHA pinning triggers Dependabot PRs that fail CI, since Dependabot workflows cannot access repository secrets (`ANTHROPIC_API_KEY`)
- The `@v1` tag auto-updates to the latest v1.x release

The Claude Code Review workflow also skips Dependabot PRs (`if: github.actor != 'dependabot[bot]'`) because Dependabot cannot access the `ANTHROPIC_API_KEY` secret needed to run the review.

## Code Review

- GitHub Actions workflow uses Claude for code review
- Custom review prompts in `.github/claude-review.md`
- Never approve PRs automatically

## npm Publishing

### Package Configuration
Required fields in `package.json`:
```json
{
  "name": "een-api-toolkit",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "examples",
    "docs/AI-CONTEXT.md",
    "docs/ai-reference",
    ".claude/agents",
    "scripts/setup-agents.ts",
    "CHANGELOG.md"
  ],
  "peerDependencies": {
    "pinia": "^3.0.0",
    "vue": "^3.3.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### Vite Library Build
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({ rollupTypes: true })  // Generate .d.ts files
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EenApiToolkit',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['vue', 'pinia'],  // Don't bundle peer dependencies
      output: {
        globals: { vue: 'Vue', pinia: 'Pinia' }
      }
    }
  }
})
```

### GitHub Secrets Required

Secrets are configured in `.env` and synced to GitHub using:
```bash
./scripts/sync-secrets.sh        # Sync all secrets
./scripts/sync-secrets.sh --dry-run  # Preview only
```

| Secret | Source | Purpose |
|--------|--------|---------|
| `ANTHROPIC_API_KEY` | .env | Claude code review |
| `CLIENT_SECRET` | .env | EEN OAuth client secret (for CI proxy) |
| `NPM_TOKEN` | .env | npm publish token (from npmjs.com) |
| `SLACK_WEBHOOK` | .env | Slack notifications |
| `TEST_PASSWORD` | .env | E2E test user password |
| `TEST_USER` | .env | E2E test user email |
| `VITE_EEN_CLIENT_ID` | .env | EEN OAuth client ID |
| `VITE_PROXY_URL` | .env | OAuth proxy URL |

### Release Flow
```
feature branch → develop → production
                              ↓
                     GitHub Actions triggers
                              ↓
                     npm run build
                     npm publish
                              ↓
                     npm install een-api-toolkit@latest
```

## Scripts

Located in `./scripts/`:

| Script | Purpose |
|--------|---------|
| `sync-secrets.sh` | Sync `.env` to GitHub repository secrets |
| `restart-proxy.sh` | Restart the local OAuth proxy on port 8787 |
| `cleanup-auth.sh` | Revoke E2E test token and remove cache file |

Usage:
```bash
./scripts/sync-secrets.sh --dry-run  # Preview what will be synced
./scripts/sync-secrets.sh            # Sync all secrets to GitHub
./scripts/restart-proxy.sh           # Start/restart local proxy
./scripts/cleanup-auth.sh            # Clean up after E2E tests
```

## Documentation

### Structure
```
docs/
├── AI-CONTEXT.md        # Single-file AI reference (comprehensive)
├── README.md            # Documentation index
├── api/                 # Auto-generated TypeDoc API reference
├── guides/              # In-depth guides
└── getting-started/     # Setup guides
examples/
└── vue-*/               # 12 complete Vue 3 example applications
```

### Generation
```bash
npm run docs              # Generate all documentation
npm run docs:api          # Generate TypeDoc API reference
npm run docs:ai-context   # Generate AI-CONTEXT.md
```

### Key Files
- **`docs/AI-CONTEXT.md`** - Complete reference for AI assistants, auto-generated from `scripts/generate-ai-context.ts`. Contains all APIs, types, patterns in one file.
- **`docs/api/`** - Auto-generated from JSDoc comments via TypeDoc
- **`examples/vue-users/`** - Working example showing OAuth flow and error handling

### Auto-Generated vs Manually Maintained Files

The `generate-ai-context.ts` script handles two categories of AI documentation:

**Auto-Generated Files** (fully regenerated on each run):
- `docs/AI-CONTEXT.md` - Single comprehensive file with all toolkit documentation
- `docs/ai-reference/AI-SETUP.md` - Vue 3 app scaffolding, Pinia, Vite configuration
- `docs/ai-reference/AI-AUTH.md` - OAuth flow, tokens, route guards
- `docs/ai-reference/AI-USERS.md` - User management API
- `docs/ai-reference/AI-DEVICES.md` - Cameras and Bridges API
- `docs/ai-reference/AI-GROUPING.md` - Layouts (camera groupings) API
- `docs/ai-reference/AI-MEDIA.md` - Media, Feeds, Live Video, HLS
- `docs/ai-reference/AI-EVENTS.md` - Events, Alerts, Metrics, SSE
- `docs/ai-reference/AI-AUTOMATIONS.md` - Automation rules and actions
- `docs/ai-reference/AI-JOBS.md` - Jobs, Exports, Files, Downloads
- `docs/ai-reference/AI-PTZ.md` - PTZ camera controls (pan/tilt/zoom, presets)
- `docs/ai-reference/AI-EVENT-DATA-SCHEMAS.md` - Event type to data schema mappings (generated from `src/events/dataSchemas.ts`)

### Source-Based Documentation Generation

Some documentation is generated directly from TypeScript source code analysis:

- **`AI-EVENT-DATA-SCHEMAS.md`** is generated by `scripts/generate-event-data-schemas-doc.ts`
- The script parses `src/events/dataSchemas.ts` and extracts:
  - `DataSchema` type union (all schema names)
  - `KnownEventType` type union (all event types)
  - `EVENT_TYPE_DATA_SCHEMAS` mapping (event types to their schemas)
- Tables and documentation are auto-generated, preventing drift between code and docs
- Called automatically by `npm run docs:ai-context`

To add new source-based documentation generators:
1. Create a new script in `scripts/` (e.g., `generate-xxx-doc.ts`)
2. Parse the relevant TypeScript source files
3. Generate markdown documentation with version header
4. Call the script from `generateSourceBasedDocs()` in `scripts/generate-ai-context.ts`

### Versioning
Documentation is generated on publish and versioned with releases:
- `AI-CONTEXT.md` includes version and generation date
- Run `npm run docs` before releasing
- Docs are included in git for GitHub browsing

### JSDoc Requirements
All exported functions and types must have JSDoc with:
- Brief description
- `@remarks` for detailed explanation
- `@param` for each parameter
- `@returns` description
- `@example` with complete, runnable code
- `@category` for grouping (Authentication, Users, Types, etc.)

## Skills

### PR-and-check (`.claude/skills/PR-and-check/`)
Use `/PR-and-check` to create a PR from a feature branch:
1. Validates current branch is a feature branch
2. Runs lint, tests, and build locally
3. Creates PR to develop with version info
4. Monitors Claude code review workflow
5. Reports review findings
