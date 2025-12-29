# Developer Guide

This guide covers development setup, architecture, testing, and the CI/CD pipeline for contributors to een-api-toolkit.

## Table of Contents

- [Development Setup](#development-setup)
- [Architecture](#architecture)
- [Code Structure](#code-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Build System](#build-system)
- [CI/CD Pipeline](#cicd-pipeline)
- [Publishing](#publishing)
- [Contributing](#contributing)

## Development Setup

### Prerequisites

- Node.js 20 LTS or later
- npm 10+
- Git
- GitHub CLI (`gh`) for workflow interaction

### Clone and Install

```bash
git clone https://github.com/klaushofrichter/een-api-toolkit.git
cd een-api-toolkit
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Required for E2E tests
VITE_EEN_CLIENT_ID=your-een-client-id
CLIENT_SECRET=your-een-client-secret
TEST_USER=your-test-email@example.com
TEST_PASSWORD=your-test-password
VITE_PROXY_URL=http://localhost:8787

# Required for npm publishing
NPM_TOKEN=npm_xxxxxxxxxxxx

# Optional: CI/CD integrations
SLACK_WEBHOOK=https://hooks.slack.com/services/xxx/xxx/xxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

### Sync Secrets to GitHub

The project includes a script to sync local secrets to GitHub:

```bash
# Preview what will be synced
./scripts/sync-secrets.sh --dry-run

# Sync secrets
./scripts/sync-secrets.sh
```

### Start the OAuth Proxy

E2E tests and the example app require the OAuth proxy:

```bash
# Start/restart the proxy
./scripts/restart-proxy.sh
```

Or manually:

```bash
cd ../een-oauth-proxy/proxy
npm run dev
```

## Architecture

### Security Model

The toolkit implements a secure OAuth pattern where **refresh tokens never reach the client**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            Client Application                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                        een-api-toolkit                                  │  │
│  │  ┌────────────────┐    ┌────────────────┐    ┌───────────┐             │  │
│  │  │  Auth Service  │    │  API Services  │    │  Pinia    │             │  │
│  │  │  - getAuthUrl  │    │  - getUsers    │    │  Store    │             │  │
│  │  │  - callback    │    │  - getUser     │    │  (token)  │             │  │
│  │  │  - revokeToken │    │  - getCurrentU │    │           │             │  │
│  │  └────────────────┘    └────────────────┘    └───────────┘             │  │
│  └─────────│──────────────────────│───────────────────────────────────────┘  │
│            │                      │                                          │
│            │   Only access token stored in browser                           │
└────────────│──────────────────────│──────────────────────────────────────────┘
             │                      │
Auth calls   │                      │  API calls (with Bearer token)
             ▼                      ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│      OAuth Proxy        │    │      EEN API v3.0       │
│  (local or deployed)    │    │                         │
│                         │    │  - /api/v3.0/users      │
│  Stores refresh tokens  │    │  - /api/v3.0/users/self │
│  Returns access tokens  │    │  - /api/v3.0/users/{id} │
└─────────────────────────┘    └─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│       EEN OAuth         │
└─────────────────────────┘
```

### Key Design Decisions

1. **Dual API Style**: Both composables (reactive) and plain functions (framework-agnostic)
2. **Result Objects**: Always return `{data, error}`, never throw exceptions
3. **Auto Token Refresh**: Handled transparently by the auth service
4. **Type Safety**: Types generated from OpenAPI spec
5. **No Built-in Caching**: Consuming apps handle caching as needed
6. **Pinia Dependency**: The toolkit uses Pinia internally for auth state management. Consuming apps must install and configure Pinia before calling `initEenToolkit()` or using any composables. Failure to do so results in a "getActivePinia() was called but there was no active Pinia" error.

## Code Structure

```
src/
├── auth/                    # Authentication module
│   ├── service.ts           # OAuth flow: login, callback, revokeToken, refresh
│   ├── store.ts             # Pinia store: token, baseUrl, session state
│   └── index.ts             # Module exports
│
├── users/                   # Users API module
│   ├── service.ts           # Plain functions: getUsers, getUser, getCurrentUser
│   ├── composables.ts       # Composables: useUsers, useUser, useCurrentUser
│   └── index.ts             # Module exports
│
├── types/                   # TypeScript types
│   ├── index.ts             # All type definitions and exports
│   └── ...
│
├── utils/                   # Utilities
│   ├── debug.ts             # Debug logging
│   └── index.ts
│
├── config.ts                # Global configuration
└── index.ts                 # Package entry point
```

> **Note:** Additional API modules (bridges, cameras, etc.) will follow the same pattern as users/ when implemented.

### Adding a New API Resource

To add support for a new EEN API resource (e.g., `sensors`):

1. **Create the module directory:**

```bash
mkdir src/sensors
```

2. **Create the service file** (`src/sensors/sensorService.ts`):

```typescript
import { useAuthStore } from '../auth'
import type { Result, ApiError } from '../types'

export interface Sensor {
  id: string
  name: string
  // ... other fields from EEN API spec
}

export interface GetSensorsParams {
  pageSize?: number
  pageToken?: string
}

export interface GetSensorsResponse {
  results: Sensor[]
  nextPageToken?: string
}

export async function getSensors(
  params?: GetSensorsParams
): Promise<Result<GetSensorsResponse>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return {
      data: null,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' }
    }
  }

  const queryParams = new URLSearchParams()
  if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize))
  if (params?.pageToken) queryParams.append('pageToken', params.pageToken)

  const url = `${authStore.baseUrl}/api/v3.0/sensors?${queryParams}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      // For a more robust implementation, see `handleErrorResponse` in `src/users/service.ts`
      return {
        data: null,
        error: { code: 'API_ERROR', message: `API Error: ${response.statusText}`, status: response.status }
      }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: { code: 'NETWORK_ERROR', message: String(err) }
    }
  }
}
```

3. **Create the composable** (`src/sensors/useSensors.ts`):

```typescript
import { ref, computed, onMounted } from 'vue'
import { getSensors, type Sensor, type GetSensorsParams } from './sensorService'

export function useSensors(params?: GetSensorsParams) {
  const sensors = ref<Sensor[]>([])
  const loading = ref(false)
  const error = ref<{ code: string; message: string } | null>(null)
  const nextPageToken = ref<string | undefined>()

  const hasNextPage = computed(() => !!nextPageToken.value)

  async function fetch(pageToken?: string) {
    loading.value = true
    error.value = null

    const result = await getSensors({
      ...params,
      pageToken
    })

    loading.value = false

    if (result.error) {
      error.value = result.error
      return
    }

    if (pageToken) {
      sensors.value.push(...result.data.results)
    } else {
      sensors.value = result.data.results
    }

    nextPageToken.value = result.data.nextPageToken
  }

  async function fetchNextPage() {
    if (hasNextPage.value) {
      await fetch(nextPageToken.value)
    }
  }

  async function refresh() {
    nextPageToken.value = undefined
    await fetch()
  }

  onMounted(() => fetch())

  return {
    sensors,
    loading,
    error,
    hasNextPage,
    fetchNextPage,
    refresh
  }
}
```

4. **Export from module** (`src/sensors/index.ts`):

```typescript
export * from './sensorService'
export * from './useSensors'
```

5. **Add to package exports** (`src/index.ts`):

```typescript
export * from './sensors'
```

6. **Add tests** (unit and E2E)

7. **Update documentation** (JSDoc, AI-CONTEXT.md)

## Development Workflow

### Branch Strategy

```
feature/* ──→ develop ──→ production
                 │              │
                 │              └──→ npm publish
                 │              └──→ GitHub Release
                 │
                 └──→ integration testing
```

- **`develop`**: Integration branch for testing
- **`production`**: Release branch (protected)
- **Feature branches**: Created from `develop`

### Husky Pre-commit Hook

The pre-commit hook automatically increments the patch version when source files change:

```bash
# .husky/pre-commit
npm version patch --no-git-tag-version
git add package.json package-lock.json
```

### Creating a PR

Use the project skill for consistent PR creation:

```bash
/PR-and-check
```

This runs lint, tests, and build before creating the PR.

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

Unit tests are located alongside source files: `src/**/*.test.ts`

### E2E Tests (Playwright)

E2E tests authenticate with the real EEN API:

```bash
# Prerequisites: start the OAuth proxy
./scripts/restart-proxy.sh

# Run E2E tests
npm run test:e2e

# Run with Playwright UI
npm run test:e2e:ui
```

E2E tests are in `examples/vue-basic/e2e/`.

**Token Caching**: Auth tokens are cached in `e2e/.auth-state.json` to speed up repeated test runs. Delete this file to force re-authentication.

**Cleanup**: After testing, revoke tokens:

```bash
./scripts/cleanup-auth.sh
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

## Build System

### Vite Library Build

The project uses Vite in library mode:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EenApiToolkit',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['vue', 'pinia'],  // Peer dependencies not bundled
    }
  }
})
```

### Build Commands

```bash
# Build the library
npm run build

# Build and verify package structure
npm run verify-package

# Generate TypeDoc API documentation
npm run docs:api

# Generate AI-CONTEXT.md
npm run docs:ai-context

# Generate all documentation
npm run docs
```

### Output Structure

```
dist/
├── index.js        # ESM build
├── index.cjs       # CommonJS build
└── index.d.ts      # TypeScript declarations
```

## CI/CD Pipeline

### GitHub Actions Workflows

Located in `.github/workflows/`:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `claude-code-review.yml` | PR open/sync | AI code review via Claude |
| `claude.yml` | @claude mention | Interactive Claude responses |
| `sync-develop.yml` | PR merged to production | Sync production changes back to develop |
| `test-release.yml` | PR merged to production | Run full test suite including E2E |
| `npm-publish.yml` | test-release success | Publish to npm, create GitHub Release |

### Test Release Workflow

Runs when a PR is merged to `production`:

1. Checkout code
2. Install dependencies
3. Run linting and type checking
4. Run unit tests
5. Build and verify package
6. Clone and start OAuth proxy
7. Run E2E tests
8. On success, trigger npm-publish

### npm Publish Workflow

Triggered after successful test-release:

1. Build the package
2. Generate CHANGELOG from merged PRs
3. Publish to npm registry
4. Create GitHub Release with:
   - Package tarball
   - Release notes
5. Send Slack notification

### Required GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `VITE_EEN_CLIENT_ID` | E2E test OAuth client ID |
| `CLIENT_SECRET` | E2E test OAuth client secret |
| `TEST_USER` | E2E test user email |
| `TEST_PASSWORD` | E2E test user password |
| `VITE_PROXY_URL` | OAuth proxy URL |
| `NPM_TOKEN` | npm publish token |
| `SLACK_WEBHOOK` | Release notifications |
| `ANTHROPIC_API_KEY` | Claude code review |

Sync with: `./scripts/sync-secrets.sh`

## Publishing

### Automatic Publishing

Merging to `production` triggers automatic publishing:

1. PR merged to production
2. `test-release.yml` runs tests
3. On success, `npm-publish.yml` publishes

### Manual Publishing

```bash
# Login to npm
npm login

# Build
npm run build

# Dry run (preview)
npm publish --dry-run

# Publish
npm publish
```

### Version Management

- **Patch**: Auto-incremented on each commit (Husky)
- **Minor/Major**: Update manually in `package.json`

### Pre-release Versions

For testing before official release:

```bash
# Update version
npm version prerelease --preid=beta

# Publish with tag
npm publish --tag beta
```

Install pre-release: `npm install een-api-toolkit@beta`

## Contributing

### Code Style

- TypeScript strict mode
- ESLint for linting (no Prettier)
- JSDoc comments on all exports
- Result objects (`{data, error}`) instead of exceptions

### JSDoc Requirements

All exported functions must have JSDoc:

```typescript
/**
 * Fetches the list of users from the EEN API.
 *
 * @remarks
 * Requires authentication. Returns paginated results.
 *
 * @param params - Optional pagination parameters
 * @returns Promise resolving to users list or error
 *
 * @example
 * ```typescript
 * const { data, error } = await getUsers({ pageSize: 50 })
 * if (data) {
 *   console.log('Users:', data.results)
 * }
 * ```
 *
 * @category Users
 */
export async function getUsers(params?: GetUsersParams): Promise<Result<GetUsersResponse>>
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes with tests
3. Run locally: `npm run lint && npm test && npm run build`
4. Create PR to `develop` using `/PR-and-check`
5. Address Claude code review feedback
6. Merge after approval

### Security Considerations

When contributing, ensure:

- No secrets in code or logs
- Input validation at boundaries
- No XSS or injection vulnerabilities
- Tokens handled securely (never logged)
- Error messages don't leak sensitive info

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm run build` | Build library to `dist/` |
| `npm run dev` | Start Vite dev server |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | Check code style |
| `npm run typecheck` | TypeScript type checking |
| `npm run docs` | Generate all documentation |
| `npm run verify-package` | Build and verify package exports |
| `./scripts/sync-secrets.sh` | Sync .env to GitHub secrets |
| `./scripts/restart-proxy.sh` | Start/restart OAuth proxy |
| `./scripts/cleanup-auth.sh` | Revoke test tokens |
