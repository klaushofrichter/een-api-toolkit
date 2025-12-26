# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library ("Toolkit") implementing the Eagle Eye Networks (EEN) Video platform API v3.0 for use with Vue 3 Composition API applications. The library is published to npm as `een-api-toolkit`.

## Technology Stack

- **Build**: Vite + npm
- **Language**: TypeScript (strict mode)
- **HTTP Client**: Native fetch
- **State Management**: Pinia (for auth state)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Linting**: ESLint only (no Prettier)
- **Node.js**: Minimum version 20 LTS

## Architecture

### Source Structure (`./src/een-api-toolkit/`)
Organized by resource (mirrors EEN API structure):
```
src/een-api-toolkit/
├── users/          # User API: service functions + useUsers() composable
├── bridges/        # Bridge API: service functions + useBridges() composable
├── cameras/        # Camera API: service functions + useCameras() composable
├── auth/           # Authentication: Pinia store + auth service
├── types/          # TypeScript types (auto-generated from OpenAPI)
└── index.ts        # Single entry point export
```

### Key Patterns
- **API Style**: Both plain async functions AND Vue 3 composables
  - Plain functions: `getUsers()`, `getCameras()` - familiar, easy to test, framework-agnostic
  - Composables: `useUsers()`, `useCameras()` - reactive state for Vue 3 apps
- **Authentication**: Pinia store exported for direct use (`useAuthStore()`)
- **Error Handling**: Return `{data, error}` result objects, never throw exceptions
- **Type Generation**: Auto-generate from OpenAPI spec using openapi-typescript
- **Pagination**: Follow EEN API's native pagination approach
- **Data Fetching**: On demand only, expose `refresh()` method
- **Logging**: Debug mode via `VITE_DEBUG=true` environment variable
- **Caching**: None built-in (consuming apps handle if needed)

### Configuration
- **Proxy URL**: Via environment variable (`VITE_PROXY_URL` in `.env`)
- Uses OAuth via proxy server from `../een-oauth-proxy`

### Package Export
Single entry point supporting both patterns:
```typescript
// Vue composables (reactive)
import { useUsers, useCameras, useBridges, useAuthStore } from 'een-api-toolkit'

// Plain async functions (framework-agnostic)
import { getUsers, getCameras, getBridges } from 'een-api-toolkit'

// Auth helpers
import { initEenToolkit, getAuthUrl, handleAuthCallback } from 'een-api-toolkit'
```

## API Implementation Priority

1. Users (starting point)
2. Bridges
3. Cameras
4. (additional resources as needed)

Only implement non-destructive GET and POST APIs until explicitly instructed to add PUT, DELETE, or PATCH.

## API Reference

- EEN API 3.0 spec: https://github.com/EENCloud/api-v3-documentation/tree/development/api/3.0
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
- `token` - Access token (short-lived, ~1 hour)
- `tokenExpiration` - Timestamp when token expires
- `refreshTokenMarker` - Indicates refresh token exists (actual token stored server-side)
- `sessionId` - For header-based auth fallback
- `hostname` / `port` - EEN API base URL components
- `baseUrl` - Computed from hostname + port

Auto-refresh: Trigger at 5 minutes before expiration OR 50% of token lifetime (whichever is earlier).

## Demo Applications

### In-repo examples (`/examples`)
Simple example apps for testing during development.

### External demo (`../een-api-toolkit-demo1`)
Isolated Vue 3 app that imports `een-api-toolkit` via npm. Use this to verify the published package works correctly with 100% isolation from the toolkit source.

### Common requirements
- Port 3333 on IP 127.0.0.1 (not "localhost")
- Launch scripts should kill existing process on port 3333: `lsof -ti :3333 | xargs kill -9 2>/dev/null`
- Requires running proxy server from `../een-oauth-proxy`

## Branch Strategy

- `develop`: integration testing branch
- `production`: release branch for well-tested packages
- Feature branches merge into `develop` before going to `production`
- Version number tracked in `./package.json`
- Husky auto-increments patch version on commit; minor/major updated manually

## Husky Setup

Pre-commit hook auto-increments patch version when source files change:
```bash
# Install husky (done via npm prepare script)
npm install

# Hook location: .husky/pre-commit
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

Located in `.github/workflows/`. Reference: `../een-oauth-proxy/.github/workflows/`

### Code Review (`pr-review.yml`)
- Triggers on PR to develop/production
- Uses `anthropics/claude-code-action@v1`
- Reads custom prompts from `.github/claude-review.md`
- Posts review as PR comment

### Branch Protection (`validate-branch-protection.yml`)
- Enforces: production only accepts from develop
- Warns: feature branches should target develop
- Prevents: develop from merging to production directly

### Testing (`test-pr.yml`)
- Runs on PR affecting source code
- Executes: lint, unit tests, build
- Uploads test artifacts on failure

### npm Package Release (`release.yml`)
- Triggers on push to production
- Builds and publishes to npm registry
- Creates GitHub release with version tag
- Sends Slack notification
- Requires `NPM_TOKEN` secret (from npmjs.com → Account → Access Tokens)

### Sync Develop (`sync-develop.yml`)
- Auto-syncs develop after production PR merge
- Keeps branches in sync

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
  "files": ["dist"],
  "peerDependencies": {
    "pinia": "^2.0.0 || ^3.0.0",
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
| `VITE_EEN_CLIENT_ID` | .env | EEN OAuth client ID |
| `TEST_USER` | .env | E2E test user email |
| `TEST_PASSWORD` | .env | E2E test user password |
| `VITE_PROXY_URL` | .env | OAuth proxy URL |
| `NPM_TOKEN` | .env | npm publish token (from npmjs.com) |
| `SLACK_WEBHOOK` | .env | Slack notifications |
| `ANTHROPIC_API_KEY` | .env | Claude code review |

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

Usage:
```bash
./scripts/sync-secrets.sh --dry-run  # Preview what will be synced
./scripts/sync-secrets.sh            # Sync all secrets to GitHub
```

## Skills

### PR-and-check (`.claude/skills/PR-and-check/`)
Use `/PR-and-check` to create a PR from a feature branch:
1. Validates current branch is a feature branch
2. Runs lint, tests, and build locally
3. Creates PR to develop with version info
4. Monitors Claude code review workflow
5. Reports review findings
