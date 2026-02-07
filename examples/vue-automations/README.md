# EEN API Toolkit - Vue Automations Example

A complete example showing how to use the een-api-toolkit automation functions in a Vue 3 application.

## Storage Strategy: Memory

This example uses the `memory` storage strategy for maximum security. This means:

- **Tokens are never written to disk** - immune to localStorage/sessionStorage XSS attacks
- **Page refresh requires re-authentication** - tokens exist only in memory
- **Each tab is independent** - opening a new tab requires separate login

This is the recommended strategy for high-security deployments where protecting against XSS token theft is critical.

## Features Demonstrated

- OAuth authentication flow (login, callback, logout)
- Protected routes with navigation guards
- List event alert condition rules
- List alert condition rules with actions and insights
- List alert action rules
- List alert actions (notifications, webhooks, etc.)
- Filter by enabled status
- Pagination support

## APIs Used

- `listEventAlertConditionRules()` - List event alert condition rules
- `listAlertConditionRules()` - List alert condition rules with optional includes
- `listAlertActionRules()` - List alert action rules
- `listAlertActions()` - List alert actions
- `getCurrentUser()` - Get current user profile
- `useAuthStore()` - Authentication state management
- `getAuthUrl()` - Generate OAuth login URL
- `handleAuthCallback()` - Process OAuth callback
- `revokeToken()` - Revoke authentication token on logout
- `initEenToolkit()` - Toolkit initialization
- `getStorageStrategy()` - Get the current storage strategy
- `STORAGE_STRATEGY_DESCRIPTIONS` - Human-readable storage strategy descriptions

## Setup

### Prerequisites

1. **Start the OAuth proxy** (required for authentication):

   The OAuth proxy is a separate project that handles token management securely.
   Clone and run it from: https://github.com/klaushofrichter/een-oauth-proxy

   ```bash
   # In a separate terminal, from the een-oauth-proxy directory
   npm install
   npm run dev
   ```

   The proxy should be running at `http://localhost:8787`.

### Example Setup

All commands below should be run from this example directory (`examples/vue-automations/`):

2. Copy the environment file:
   ```bash
   # From examples/vue-automations/
   cp .env.example .env
   ```

3. Edit `.env` with your EEN credentials:
   ```env
   VITE_EEN_CLIENT_ID=your-client-id
   VITE_PROXY_URL=http://localhost:8787
   # DO NOT change the redirect URI - EEN IDP only permits this URL
   VITE_REDIRECT_URI=http://127.0.0.1:3333
   ```

4. Install dependencies and start:
   ```bash
   # From examples/vue-automations/
   npm install
   npm run dev
   ```

5. Open http://127.0.0.1:3333 in your browser.

**Important:** The EEN Identity Provider only permits `http://127.0.0.1:3333` as the OAuth redirect URI. Do not use `localhost` or other ports.

**Note:** Development and testing was done on macOS. The `npm run stop` command uses `lsof`, which is not available on Windows. Windows users should manually stop any process on port 3333 or use `npx kill-port 3333` instead.

## Project Structure

```
src/
├── main.ts          # App entry, toolkit initialization
├── App.vue          # Root component with navigation
├── router/
│   └── index.ts     # Vue Router with auth guards
└── views/
    ├── Home.vue        # Home page with user profile
    ├── Login.vue       # OAuth login redirect
    ├── Callback.vue    # OAuth callback handler
    ├── Automations.vue # Automation rules display
    └── Logout.vue      # Logout handler
```

## Key Code Examples

### Initializing the Toolkit (main.ts)

```typescript
import { initEenToolkit } from 'een-api-toolkit'

initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID,
  storageStrategy: 'memory',  // Maximum security - tokens lost on refresh
  debug: true
})
```

### Listing Event Alert Condition Rules

```typescript
import { listEventAlertConditionRules, type EventAlertConditionRule } from 'een-api-toolkit'

const rules = ref<EventAlertConditionRule[]>([])

async function fetchRules() {
  const result = await listEventAlertConditionRules({
    pageSize: 10,
    enabled: true  // Only enabled rules
  })

  if (result.error) {
    // Handle error
  } else {
    rules.value = result.data.results
  }
}
```

### Listing Alert Condition Rules with Includes

```typescript
import { listAlertConditionRules, type AlertConditionRule } from 'een-api-toolkit'

const rules = ref<AlertConditionRule[]>([])

async function fetchRules() {
  const result = await listAlertConditionRules({
    pageSize: 10,
    include: ['actions', 'insights']  // Include related data
  })

  if (result.error) {
    // Handle error
  } else {
    rules.value = result.data.results
    // Each rule now has rule.actions and rule.insights populated
  }
}
```

### Listing Alert Actions

```typescript
import { listAlertActions, type AutomationAlertAction } from 'een-api-toolkit'

const actions = ref<AutomationAlertAction[]>([])

async function fetchActions() {
  const result = await listAlertActions({
    pageSize: 10,
    type__in: ['notification', 'webhook', 'slack']  // Filter by action type
  })

  if (result.error) {
    // Handle error
  } else {
    actions.value = result.data.results
  }
}
```

### Auth Guard (router/index.ts)

```typescript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

## Running E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```
