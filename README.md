# een-api-toolkit

A TypeScript library for the [Eagle Eye Networks (EEN)](https://een.com/) Video Platform API v3.0, designed for Vue 3 applications.

## Purpose

This toolkit aims to **simplify and accelerate web application development** for the EEN Video Platform. By providing type-safe APIs and secure authentication patterns, developers can focus on building features rather than wrestling with API integration details.

The project is also designed to **enable AI-assisted software development**. With comprehensive documentation, clear code patterns, and an AI-optimized context file (`docs/AI-CONTEXT.md`), AI coding assistants can effectively help developers build, extend, and maintain applications using this toolkit.

This repository is provided as-is without any warranty, functionality guarantee, or assurance of availability. This repository uses EEN's services but is not affiliated with Eagle Eye Networks.

> **Note:** Work in progress - do not use in production yet.

![Architecture diagram showing TypeScript library with Vue 3 and Pinia integration, secure OAuth proxy design, multi-layered testing with Vitest and Playwright, and AI-powered CI/CD pipeline](./docs/images/een-api-toolkit-infograph.png)

## Key Features

- **Plain Async Functions** - Simple API calls with `getCurrentUser()`, `getUsers()`, `getCameras()`, `getLayouts()`, and more
- **Secure OAuth** - Token management via proxy (refresh tokens never exposed to client)
- **Type-Safe** - Full TypeScript types from OpenAPI spec
- **Predictable Errors** - Always returns `{data, error}`, no exceptions thrown
- **Pinia Auth Store** - Reactive authentication state management

## OAuth Proxy Requirement

This toolkit's authentication is designed to work with [een-oauth-proxy](https://github.com/klaushofrichter/een-oauth-proxy), a secure OAuth proxy implementation that:

- Keeps refresh tokens server-side (never exposed to the browser)
- Handles token exchange and refresh automatically
- Provides session management via secure cookies

**Using a different proxy?** While other OAuth proxy implementations can be used, you may need to adapt the authentication flow. The toolkit expects specific proxy endpoints (`/proxy/getAccessToken`, `/proxy/refreshAccessToken`, `/proxy/revoke`).

## Quick Start

### 1. Install

```bash
npm install een-api-toolkit
```

### 2. Set Up OAuth Proxy

The toolkit requires an OAuth proxy to securely handle authentication. See [een-oauth-proxy](https://github.com/klaushofrichter/een-oauth-proxy) for a Cloudflare Worker implementation.

```bash
# Clone and start the proxy
git clone https://github.com/klaushofrichter/een-oauth-proxy.git
cd een-oauth-proxy/proxy
npm install
npm run dev  # Runs at http://localhost:8787
```

> **Important:** Your app must run on `http://127.0.0.1:3333` (not `localhost`) and handle OAuth callbacks on the root path `/`. The EEN Identity Provider requires an exact URI match. See [Troubleshooting](./docs/USER-GUIDE.md#oauth-redirect-uri-requirements-critical) for details.

### 3. Initialize in Your App

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initEenToolkit } from 'een-api-toolkit'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())

initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,  // http://localhost:8787
  clientId: import.meta.env.VITE_EEN_CLIENT_ID
})

app.mount('#app')
```

### 4. Add Authentication

```typescript
import { getAuthUrl, handleAuthCallback } from 'een-api-toolkit'

// Redirect to EEN login
const login = () => {
  window.location.href = getAuthUrl()
}

// Handle callback (after EEN redirects back)
const onCallback = async (code: string, state: string) => {
  const { error } = await handleAuthCallback(code, state)
  if (error) {
    console.error('Auth failed:', error.message)
    return
  }
  // User is authenticated, token stored in Pinia
  router.push('/dashboard')
}
```

### 5. Use the API

```typescript
import { getUsers, getCurrentUser, getCameras } from 'een-api-toolkit'

// Get current authenticated user
const { data: currentUser, error: userError } = await getCurrentUser()
if (userError) {
  console.error(userError.code, userError.message)
} else {
  console.log('Current user:', currentUser.email)
}

// Get list of users with pagination
const { data: usersData, error } = await getUsers({ pageSize: 10 })
if (error) {
  console.error(error.code, error.message)
} else {
  console.log('Users:', usersData.results)
  if (usersData.nextPageToken) {
    // Fetch next page
    const { data: nextPage } = await getUsers({ pageToken: usersData.nextPageToken })
  }
}

// Get list of cameras
const { data: camerasData, error: cameraError } = await getCameras({
  pageSize: 20,
  include: ['deviceInfo', 'status']
})
if (!cameraError) {
  console.log('Cameras:', camerasData.results)
}
```

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Your Vue 3 App                               │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                   import from 'een-api-toolkit'                │  │
│  │           ┌────────────────────────────────────┐               │  │
│  │           │     Plain Async Functions          │               │  │
│  │           │  getUsers(), getCameras(), etc.    │               │  │
│  │           │  getLayouts(), createLayout()...   │               │  │
│  │           └────────────────────────────────────┘               │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                      │                               │
│                                      ▼                               │
│       ┌─────────────────────┐        ┌─────────────────────┐         │
│       │   Pinia Auth Store  │◄──────►│   API Calls with    │         │
│       │   (token, baseUrl)  │        │   Bearer Token      │         │
│       └─────────────────────┘        └─────────────────────┘         │
└────────────────────│─────────────────────────────│───────────────────┘
                     │                             │
        Auth calls   │                             │  API calls
     (login/refresh) │                             │  (data)
                     ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │    OAuth Proxy      │       │     EEN API v3.0    │
        │  (local or cloud)   │       │                     │
        └─────────────────────┘       └─────────────────────┘
                     │
                     ▼
        ┌─────────────────────┐
        │    EEN OAuth        │
        └─────────────────────┘
```

## Documentation

| Document | Description |
|----------|-------------|
| **[User Guide](./docs/USER-GUIDE.md)** | Installation, proxy setup, configuration, building apps |
| **[Developer Guide](./docs/DEVELOPER-GUIDE.md)** | Architecture, testing, CI/CD, contributing |
| **[API Reference](./docs/api/)** | Auto-generated TypeDoc documentation |
| **[AI Context](./docs/AI-CONTEXT.md)** | Single-file reference for AI assistants (also in npm package) |
| **[AI Prompts](./docs/Prompts.md)** | Example prompts for generating apps with AI |

## Claude Code Agents

The toolkit includes specialized [Claude Code](https://docs.anthropic.com/en/docs/claude-code) agents for AI-assisted development. These agents have deep knowledge of the EEN API and toolkit patterns.

> **Note:** These agents use Claude Code's specific format. To use with other AI assistants (Gemini CLI, Copilot, etc.), the agent specs would need conversion.

**Available agents:**
- `een-setup-agent` - Project scaffolding, Pinia setup, Vite configuration
- `een-auth-agent` - OAuth flows, route guards, token management
- `een-users-agent` - User listing and profile APIs
- `een-devices-agent` - Camera and bridge management
- `een-media-agent` - Live video, previews, HLS playback
- `een-events-agent` - Events, alerts, metrics, SSE subscriptions
- `een-grouping-agent` - Layouts CRUD operations, camera pane management

**Installation:**
```bash
npx een-setup-agents
```

> **Important:** After running the setup script, **restart Claude Code** for the agents to become available.

See the [User Guide](./docs/USER-GUIDE.md#claude-code-agents) for detailed agent documentation.

## Example Applications

The `examples/` directory contains complete Vue 3 applications demonstrating toolkit features:

| Example | Description | APIs Used |
|---------|-------------|-----------|
| **[vue-users](./examples/vue-users/)** | User management with pagination | `getUsers()`, `getCurrentUser()` |
| **[vue-cameras](./examples/vue-cameras/)** | Camera listing with status filters | `getCameras()` |
| **[vue-bridges](./examples/vue-bridges/)** | Bridge listing with device info | `getBridges()` |
| **[vue-layouts](./examples/vue-layouts/)** | Layout CRUD with camera panes | `getLayouts()`, `createLayout()`, `updateLayout()`, `deleteLayout()` |
| **[vue-media](./examples/vue-media/)** | Live and recorded image viewing | `getCameras()`, `getLiveImage()`, `getRecordedImage()` |
| **[vue-feeds](./examples/vue-feeds/)** | Live video streaming with preview and main streams | `getCameras()`, `listFeeds()`, `initMediaSession()` |
| **[vue-events](./examples/vue-events/)** | Event listing with bounding box overlays | `listEvents()`, `listEventTypes()`, `listEventFieldValues()`, `getRecordedImage()` |
| **[vue-alerts-metrics](./examples/vue-alerts-metrics/)** | Event metrics, alerts, and notifications dashboard | `getEventMetrics()`, `listAlerts()`, `listAlertTypes()`, `listNotifications()` |
| **[vue-event-subscriptions](./examples/vue-event-subscriptions/)** | Real-time event streaming with SSE | `listEventSubscriptions()`, `createEventSubscription()`, `deleteEventSubscription()`, `connectToEventSubscription()` |
| **[vue-automations](./examples/vue-automations/)** | Automation rules and alert actions | `listEventAlertConditionRules()`, `listAlertConditionRules()`, `listAlertActionRules()`, `listAlertActions()` |
| **[vue-jobs](./examples/vue-jobs/)** | Job management, exports, and file downloads | `listJobs()`, `getJob()`, `createExportJob()`, `listFiles()`, `downloadFile()` |

Each example includes:
- Complete OAuth authentication flow
- E2E tests with Playwright
- Proper error handling patterns
- TypeScript types throughout

To run an example:
```bash
cd examples/vue-users
npm install
npm run dev  # Runs at http://127.0.0.1:3333
```

> **Note:** Examples require a running OAuth proxy. See [Quick Start](#2-set-up-oauth-proxy).

## Running E2E Tests

Each example includes Playwright E2E tests that test the full OAuth login flow. Tests are designed to skip gracefully when the OAuth proxy or credentials are unavailable.

### Prerequisites

1. **OAuth Proxy**: Start the proxy server:
   ```bash
   ./scripts/restart-proxy.sh  # Starts proxy at http://127.0.0.1:8787
   ```

2. **Environment Variables**: Create a `.env` file in the project root:
   ```bash
   VITE_PROXY_URL=http://127.0.0.1:8787
   VITE_EEN_CLIENT_ID=your_client_id
   TEST_USER=your_test_email
   TEST_PASSWORD=your_test_password
   ```

### Running Tests

```bash
# Run E2E tests for a specific example
cd examples/vue-users
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui
```

### Test Behavior

- **Proxy unavailable**: OAuth tests are automatically skipped with message "OAuth proxy not accessible"
- **Credentials missing**: OAuth tests are skipped with message "Test credentials not available"
- **Basic tests**: Tests that don't require OAuth (e.g., checking login button visibility) always run

> **Note:** All development and testing has been done on macOS. The `lsof` command used in scripts may behave differently on other platforms.

## Scripts

Utility scripts are located in the `scripts/` directory:

| Script | Purpose |
|--------|---------|
| `sync-secrets.sh` | Sync secrets to GitHub and example apps |
| `restart-proxy.sh` | Start/restart the local OAuth proxy |
| `cleanup-auth.sh` | Revoke test tokens and clear auth cache |

### Syncing Secrets

The `sync-secrets.sh` script manages secrets from a single source (root `.env` file):

```bash
# Preview what will be synced (no changes made)
./scripts/sync-secrets.sh --dry-run

# Sync secrets to GitHub and example applications
./scripts/sync-secrets.sh
```

**What it does:**

1. **GitHub Repository Secrets** - Syncs these variables for CI/CD:
   - `ANTHROPIC_API_KEY`, `CLIENT_SECRET`, `NPM_TOKEN`, `SLACK_WEBHOOK`
   - `TEST_USER`, `TEST_PASSWORD`, `VITE_EEN_CLIENT_ID`, `VITE_PROXY_URL`

2. **Example Applications** - Copies VITE_* variables to `examples/*/.env`:
   - `VITE_PROXY_URL`, `VITE_EEN_CLIENT_ID`, `VITE_DEBUG`
   - `VITE_REDIRECT_URI` (hardcoded to `http://127.0.0.1:3333`)

**Setup:**

1. Copy `.env.example` to `.env` in the project root
2. Fill in your actual values
3. Run `./scripts/sync-secrets.sh` to distribute secrets

> **Note:** Example `.env` files are gitignored. Run `sync-secrets.sh` after cloning to set up local development.

## External Resources

- [EEN Developer Portal](https://developer.eagleeyenetworks.com/)
- [EEN API v3.0 Documentation](https://developer.eagleeyenetworks.com/reference/using-the-api)
- [EEN OAuth Application Management](https://developer.eagleeyenetworks.com/page/my-application)
- [een-oauth-proxy](https://github.com/klaushofrichter/een-oauth-proxy) - OAuth proxy server

## License

MIT

---
