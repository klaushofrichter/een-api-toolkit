# een-api-toolkit

A TypeScript library implementing the Eagle Eye Networks (EEN) Video platform API v3.0 for Vue 3 Composition API applications.

> **Note:** Work in progress - do not use in production yet.

## Installation

```bash
npm install een-api-toolkit
```

## Setup

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initEenToolkit } from 'een-api-toolkit'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())

// Initialize toolkit with proxy URL from environment
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL
})

app.mount('#app')
```

## Authentication

The toolkit uses OAuth via a proxy server. Your app handles the redirect flow:

```typescript
// Login.vue
import { getAuthUrl, handleAuthCallback } from 'een-api-toolkit'

// Redirect user to EEN login
const login = () => {
  window.location.href = getAuthUrl()
}

// Handle OAuth callback (after redirect back)
const onCallback = async (code: string, state: string) => {
  const { data, error } = await handleAuthCallback(code, state)
  if (error) {
    console.error('Auth failed:', error.message)
    return
  }
  // User is now authenticated, token stored in Pinia
  router.push('/dashboard')
}
```

## Usage

### Vue 3 Composables (Reactive)

```vue
<script setup>
import { useUsers, useCameras, useBridges } from 'een-api-toolkit'

// Composables provide reactive state
const { user, loading, error, refresh } = useUsers()
const { cameras, loading: camerasLoading } = useCameras()
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <h1>Welcome, {{ user.firstName }}</h1>
    <ul>
      <li v-for="camera in cameras" :key="camera.id">
        {{ camera.name }}
      </li>
    </ul>
    <button @click="refresh">Refresh</button>
  </div>
</template>
```

### Plain Functions (Framework-Agnostic)

```typescript
import { getUsers, getCameras, getBridges } from 'een-api-toolkit'

const fetchData = async () => {
  const { data: users, error } = await getUsers()
  if (error) {
    console.error(error.code, error.message)
    return
  }
  console.log('Users:', users)
}

// With pagination
const { data, error } = await getCameras({
  pageSize: 50,
  pageToken: 'next-page-token'
})
```

## Error Handling

All functions return `{data, error}` objects - they never throw exceptions:

```typescript
const { data, error } = await getCameras()

if (error) {
  switch (error.code) {
    case 'AUTH_REQUIRED':
      router.push('/login')
      break
    case 'API_ERROR':
      showNotification(`API Error: ${error.message}`)
      break
    case 'NETWORK_ERROR':
      showNotification('Network unavailable')
      break
  }
  return
}

// Safe to use data here
console.log(data)
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# EEN OAuth Client ID (required for authentication)
VITE_EEN_CLIENT_ID=your-een-client-id

# Test credentials for Playwright E2E tests
TEST_USER=your-test-email@example.com
TEST_PASSWORD=your-test-password

# OAuth proxy URL (required for API calls)
VITE_PROXY_URL=https://your-proxy.workers.dev

# npm access token for publishing (Automation type from npmjs.com)
NPM_TOKEN=npm_xxxxxxxxxxxx

# Slack webhook for notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/xxx/xxx/xxx

# Anthropic API key for Claude code review
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

### GitHub Secrets

GitHub Actions workflows require these secrets. Sync them from your `.env` file:

```bash
# Preview what will be synced
./scripts/sync-secrets.sh --dry-run

# Sync secrets to GitHub
./scripts/sync-secrets.sh
```

Required secrets:
| Secret | Purpose |
|--------|---------|
| `VITE_EEN_CLIENT_ID` | EEN OAuth client ID |
| `TEST_USER` | E2E test user email |
| `TEST_PASSWORD` | E2E test user password |
| `VITE_PROXY_URL` | OAuth proxy URL |
| `NPM_TOKEN` | npm publish token |
| `SLACK_WEBHOOK` | Slack notifications |
| `ANTHROPIC_API_KEY` | Claude code review |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Developer's Vue 3 App                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │              import from 'een-api-toolkit'       │   │
│  │  ┌──────────────┐    ┌────────────────────┐     │   │
│  │  │ Composables  │    │  Plain Functions   │     │   │
│  │  │ useUsers()   │    │  getUsers()        │     │   │
│  │  │ useCameras() │    │  getCameras()      │     │   │
│  │  └──────────────┘    └────────────────────┘     │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│                          ▼                              │
│              ┌─────────────────────┐                   │
│              │   Pinia Auth Store  │                   │
│              │   (token, baseUrl)  │                   │
│              └─────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────┐
              │    OAuth Proxy      │
              │ (Cloudflare Worker) │
              └─────────────────────┘
                           │
                           ▼
              ┌─────────────────────┐
              │     EEN API v3.0    │
              └─────────────────────┘
```

## Key Features

- **No direct API credentials** - OAuth handled via proxy
- **Reactive or plain** - Choose composables for Vue reactivity, plain functions for flexibility
- **Predictable errors** - Always `{data, error}`, no try/catch needed
- **Auto token refresh** - Handled internally by the toolkit
- **Type-safe** - Full TypeScript types from OpenAPI spec

## Publishing (for maintainers)

The package is published to npm automatically when changes are merged to the `production` branch.

### Version Management
- Patch version auto-increments on each commit (via Husky pre-commit hook)
- Minor/major versions updated manually in `package.json`

### Release Flow
```
feature branch → develop → production → npm publish
```

### Manual Publish
```bash
npm login
npm run build
npm publish
```

## API Reference

- [EEN API 3.0 Documentation](https://developer.eagleeyenetworks.com/reference/using-the-api)
- [EEN API 3.0 Spec](https://github.com/EENCloud/api-v3-documentation/tree/development/api/3.0)

## License

MIT
