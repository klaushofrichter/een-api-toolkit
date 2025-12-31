# een-api-toolkit

A TypeScript library for the [Eagle Eye Networks](https://een.com/) Video API v3.0, designed for Vue 3 applications.

## Purpose

This toolkit aims to **simplify and accelerate web application development** for the EEN Video Platform. By providing type-safe APIs and secure authentication patterns, developers can focus on building features rather than wrestling with API integration details.

The project is also designed to **enable AI-assisted software development**. With comprehensive documentation, clear code patterns, and an AI-optimized context file (`docs/AI-CONTEXT.md`), AI coding assistants can effectively help developers build, extend, and maintain applications using this toolkit.

> **Note:** Work in progress - do not use in production yet.

## Key Features

- **Plain Async Functions** - Simple API calls with `getCurrentUser()`, `getUsers()`, `getUser()`, `getCameras()`, `getCamera()`
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
│                         Your Vue 3 App                                │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                   import from 'een-api-toolkit'                 │  │
│  │           ┌────────────────────────────────────┐               │  │
│  │           │     Plain Async Functions          │               │  │
│  │           │     getUsers(), getCameras()       │               │  │
│  │           │     getUser(), getCamera()         │               │  │
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
| **[Example App](./examples/vue-users/)** | Complete Vue 3 example with OAuth flow |
| **[AI Context](./docs/AI-CONTEXT.md)** | Single-file reference for AI assistants (also in npm package) |
| **[AI Prompts](./docs/Prompts.md)** | Example prompts for generating apps with AI |

## External Resources

- [EEN Developer Portal](https://developer.eagleeyenetworks.com/)
- [EEN API v3.0 Documentation](https://developer.eagleeyenetworks.com/reference/using-the-api)
- [een-oauth-proxy](https://github.com/klaushofrichter/een-oauth-proxy) - OAuth proxy server

## License

MIT

---

This repository is provided as-is without warranty. It uses EEN services but is not affiliated with Eagle Eye Networks.
