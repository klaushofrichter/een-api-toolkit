# Vue 3 Application Setup - EEN API Toolkit

> **Version:** 0.3.42
>
> Complete guide for setting up a Vue 3 application with the een-api-toolkit.
> Load this document when creating a new project or troubleshooting setup issues.

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| **Node.js** | Version 20 LTS or later |
| **Vue 3.x** | The toolkit is built for Vue 3 Composition API |
| **Pinia** | Required peer dependency for state management |
| **Vite** | Recommended build tool |
| **OAuth Proxy** | Required for secure token management |

---

## Quick Start

### 1. Create Vue 3 Project

```bash
npm create vue@latest my-een-app
cd my-een-app
```

### 2. Install Dependencies

```bash
npm install een-api-toolkit pinia
```

### 3. Configure main.ts

> **⚠️ CRITICAL:** Pinia MUST be installed on the Vue app BEFORE calling
> `initEenToolkit()` or using `useAuthStore()`.

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initEenToolkit } from 'een-api-toolkit'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Install Pinia (required before initEenToolkit)
app.use(createPinia())

// Initialize EEN API Toolkit with memory storage for maximum security
// Note: Using 'memory' storage means tokens are lost on page refresh
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID,
  redirectUri: import.meta.env.VITE_REDIRECT_URI,
  storageStrategy: 'memory',
  debug: import.meta.env.VITE_DEBUG === 'true'
})

// Install router
app.use(router)

app.mount('#app')

```

### 4. Configure vite.config.ts

> **⚠️ IMPORTANT:** Must use `127.0.0.1:3333` for EEN OAuth callback.

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // IMPORTANT: Must use 127.0.0.1:3333 for EEN OAuth callback
    // The EEN Identity Provider only permits this specific redirect URI
    host: '127.0.0.1',
    port: 3333
  }
})

```

### 5. Configure Environment Variables

Create `.env` file:

```env
VITE_PROXY_URL=http://localhost:8787
VITE_EEN_CLIENT_ID=your-een-client-id
VITE_REDIRECT_URI=http://127.0.0.1:3333
VITE_DEBUG=true
```

---

## Router Setup

The router must handle OAuth callbacks on the root path and protect authenticated routes.

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from 'een-api-toolkit'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Callback from '../views/Callback.vue'
import Users from '../views/Users.vue'
import Logout from '../views/Logout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      // Handle OAuth callback on root path (EEN IDP redirects to http://127.0.0.1:3333)
      beforeEnter: (to, _from, next) => {
        // If URL has code and state params, it's an OAuth callback
        if (to.query.code && to.query.state) {
          next({ name: 'callback', query: to.query })
        } else {
          next()
        }
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    },
    {
      path: '/users',
      name: 'users',
      component: Users,
      meta: { requiresAuth: true }
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout
    }
  ]
})

// Navigation guard for protected routes
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router

```

---

## Project Structure

```
my-een-app/
├── src/
│   ├── main.ts              # Pinia + toolkit initialization
│   ├── App.vue              # Root component
│   ├── router/
│   │   └── index.ts         # Routes with auth guards
│   └── views/
│       ├── Home.vue         # Landing page
│       ├── Login.vue        # OAuth login trigger
│       ├── Logout.vue       # Token revocation
│       └── Callback.vue     # OAuth callback handler
├── .env                     # Environment variables
└── vite.config.ts           # Vite configuration
```

---

## Common Setup Errors

### "getActivePinia() was called but there was no active Pinia"

**Cause:** Pinia was not installed before `initEenToolkit()` was called.

**Solution:** Ensure `app.use(pinia)` is called BEFORE `initEenToolkit()`:

```typescript
const app = createApp(App)
app.use(createPinia())      // ✅ First
initEenToolkit({...})       // ✅ Second
app.mount('#app')           // ✅ Last
```

### "Redirect URI mismatch"

**Cause:** OAuth redirect URI doesn't exactly match `http://127.0.0.1:3333`.

**Solution:**
- Use `127.0.0.1` not `localhost`
- Use port `3333` exactly
- No trailing slash
- No path (not `/callback`)
- Register at [EEN Developer Portal](https://developer.eagleeyenetworks.com/page/my-application)

### Port 3333 already in use

**Solution:** Kill existing process:

```bash
kill $(lsof -ti :3333) 2>/dev/null || true
npm run dev
```

---

## Configuration Options

```typescript
interface EenToolkitConfig {
  proxyUrl?: string           // OAuth proxy URL (required)
  clientId?: string           // EEN OAuth client ID (required)
  redirectUri?: string        // OAuth redirect URI (default: http://127.0.0.1:3333)
  storageStrategy?: StorageStrategy  // Token storage strategy
  debug?: boolean             // Enable debug logging
}

type StorageStrategy = 'localStorage' | 'sessionStorage' | 'memory'
```

### Storage Strategies

| Strategy | Persistence | Use Case |
|----------|-------------|----------|
| `localStorage` | Survives browser restart | Default, good for most apps |
| `sessionStorage` | Per-tab, cleared on close | Multi-account scenarios |
| `memory` | Lost on page refresh | Maximum security |

---

## Next Steps

After setup, proceed to:
- [AI-AUTH.md](./AI-AUTH.md) - Implement login/logout flows
- [AI-USERS.md](./AI-USERS.md) - Work with user data
- [AI-DEVICES.md](./AI-DEVICES.md) - Work with cameras and bridges

---

## Reference Example

See `examples/vue-users/` for a complete working example.
