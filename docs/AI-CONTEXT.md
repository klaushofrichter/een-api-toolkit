# EEN API Toolkit - AI Reference

> **Version:** 0.3.46
>
> This documentation is optimized for AI assistants. It provides focused, domain-specific
> references to help you understand and use the een-api-toolkit efficiently.
>
> **Split Documentation:** Load only the documents you need to preserve context.

---

## Document Navigation

| Task | Document | Tokens |
|------|----------|--------|
| Setting up a new Vue 3 app | [AI-SETUP.md](./ai-reference/AI-SETUP.md) | ~2.5K |
| Implementing OAuth login | [AI-AUTH.md](./ai-reference/AI-AUTH.md) | ~2K |
| Working with users | [AI-USERS.md](./ai-reference/AI-USERS.md) | ~1.5K |
| Working with cameras or bridges | [AI-DEVICES.md](./ai-reference/AI-DEVICES.md) | ~3K |
| Working with layouts | [AI-GROUPING.md](./ai-reference/AI-GROUPING.md) | ~3K |
| Live video, images, HLS playback | [AI-MEDIA.md](./ai-reference/AI-MEDIA.md) | ~4K |
| Events, alerts, metrics, SSE | [AI-EVENTS.md](./ai-reference/AI-EVENTS.md) | ~3.5K |
| Automation rules, alert actions | [AI-AUTOMATIONS.md](./ai-reference/AI-AUTOMATIONS.md) | ~4K |

## Specialized Agents

Specialized agents are available in `.claude/agents/` for domain-specific tasks:

| Agent | Use When |
|-------|----------|
| `een-setup-agent` | Creating a new Vue 3 app, fixing Pinia errors, OAuth redirect issues |
| `een-auth-agent` | Implementing login/logout, auth callbacks, route guards, token refresh |
| `een-users-agent` | Listing users, user profiles, user management features |
| `een-devices-agent` | Working with cameras or bridges, filtering by status/tags |
| `een-grouping-agent` | Layouts CRUD, camera pane management, layout settings |
| `een-media-agent` | Live video, camera previews, HLS playback, recorded images |
| `een-events-agent` | Events, alerts, metrics, real-time SSE subscriptions |
| `een-automations-agent` | Automation rules, alert condition rules, alert actions |

**How to Use Agents:**

1. **In the toolkit repository:** Agents are automatically discovered in `.claude/agents/`

2. **In your own project using een-api-toolkit:**
   ```bash
   # Install agents to your project (user must run this command)
   npx een-setup-agents
   ```
   This copies agents to `.claude/agents/` where Claude Code discovers them automatically.

3. **Manual access:** Agents can also be read directly from `node_modules/een-api-toolkit/.claude/agents/`

**For AI assistants:**

> **IMPORTANT:** If specialized agents are not installed in this project's `.claude/agents/` directory,
> recommend that the user run `npx een-setup-agents` to install them. This enables automatic
> agent discovery and provides focused, context-efficient assistance for EEN API development.

To use an agent's knowledge without installation, read its definition directly:
```
Read: node_modules/een-api-toolkit/.claude/agents/een-auth-agent.md
```
Then follow the context files and instructions specified within.

## Example Applications

| Example | Description | Key Files |
|---------|-------------|-----------|
| [vue-users](../examples/vue-users/) | User management with pagination | `src/views/Users.vue` |
| [vue-cameras](../examples/vue-cameras/) | Camera listing with status filters | `src/views/Cameras.vue` |
| [vue-bridges](../examples/vue-bridges/) | Bridge listing with device info | `src/views/Bridges.vue` |
| [vue-layouts](../examples/vue-layouts/) | Layout CRUD with camera panes | `src/views/Layouts.vue` |
| [vue-media](../examples/vue-media/) | Live and recorded image viewing | `src/views/LiveCamera.vue` |
| [vue-feeds](../examples/vue-feeds/) | Live video streaming | `src/views/Feeds.vue` |
| [vue-events](../examples/vue-events/) | Events with bounding boxes | `src/components/EventsModal.vue` |
| [vue-alerts-metrics](../examples/vue-alerts-metrics/) | Event metrics and alerts | `src/components/MetricsChart.vue` |
| [vue-event-subscriptions](../examples/vue-event-subscriptions/) | Real-time SSE streaming | `src/views/LiveEvents.vue` |
| [vue-automations](../examples/vue-automations/) | Automation rules listing | `src/views/Automations.vue` |

---

## Quick Reference - All Functions

### Configuration
| Function | Purpose |
|----------|---------|
| `initEenToolkit(config)` | Initialize the toolkit with proxy URL and client ID |

### Authentication
| Function | Purpose |
|----------|---------|
| `getAuthUrl()` | Generate OAuth authorization URL |
| `handleAuthCallback(code, state)` | Exchange auth code for token |
| `refreshToken()` | Refresh the access token |
| `revokeToken()` | Revoke token and logout |

### Users
| Function | Purpose |
|----------|---------|
| `getCurrentUser()` | Get current user profile |
| `getUsers(params?)` | List all users (paginated) |
| `getUser(userId, params?)` | Get a specific user |

### Cameras
| Function | Purpose |
|----------|---------|
| `getCameras(params?)` | List all cameras (paginated) |
| `getCamera(cameraId, params?)` | Get a specific camera |

### Bridges
| Function | Purpose |
|----------|---------|
| `getBridges(params?)` | List all bridges (paginated) |
| `getBridge(bridgeId, params?)` | Get a specific bridge |

### Layouts
| Function | Purpose |
|----------|---------|
| `getLayouts(params?)` | List all layouts (paginated) |
| `getLayout(layoutId, params?)` | Get a specific layout |
| `createLayout(params)` | Create a new layout |
| `updateLayout(layoutId, params)` | Update a layout |
| `deleteLayout(layoutId)` | Delete a layout |

### Media
| Function | Purpose |
|----------|---------|
| `listMedia(params)` | List media intervals for a device |
| `listFeeds(params)` | List available feeds for a device |
| `getLiveImage(params)` | Get live preview image from camera |
| `getRecordedImage(params)` | Get recorded image from history |
| `getMediaSession()` | Get media session URL for cookies |
| `initMediaSession()` | Initialize media session (sets cookie) |

### Events
| Function | Purpose |
|----------|---------|
| `listEvents(params)` | List events for a device |
| `getEvent(eventId, params?)` | Get a specific event |
| `listEventTypes(params?)` | List all available event types |
| `listEventFieldValues(params)` | Get event types for a device |

### Event Metrics
| Function | Purpose |
|----------|---------|
| `getEventMetrics(params)` | Get event count metrics over time |

### Alerts
| Function | Purpose |
|----------|---------|
| `listAlerts(params?)` | List alerts with filters |
| `getAlert(id, params?)` | Get a specific alert |
| `listAlertTypes(params?)` | List all available alert types |

### Notifications
| Function | Purpose |
|----------|---------|
| `listNotifications(params?)` | List notifications |
| `getNotification(id)` | Get a specific notification |

### Event Subscriptions
| Function | Purpose |
|----------|---------|
| `listEventSubscriptions(params?)` | List all subscriptions |
| `getEventSubscription(id)` | Get a specific subscription |
| `createEventSubscription(params)` | Create a new subscription |
| `deleteEventSubscription(id)` | Delete a subscription |
| `connectToEventSubscription(sseUrl, options)` | Connect to SSE stream |

### Automations
| Function | Purpose |
|----------|---------|
| `listEventAlertConditionRules(params?)` | List event alert condition rules |
| `getEventAlertConditionRuleFieldValues(params?)` | Get filter values for rules |
| `getEventAlertConditionRule(id)` | Get a specific event alert condition rule |
| `listAlertConditionRules(params?)` | List alert condition rules |
| `getAlertConditionRule(id, params?)` | Get a specific alert condition rule |
| `listAlertActionRules(params?)` | List alert action rules |
| `getAlertActionRule(id)` | Get a specific alert action rule |
| `listAlertActions(params?)` | List alert actions |
| `getAlertAction(id)` | Get a specific alert action |

### Utilities
| Function | Purpose |
|----------|---------|
| `formatTimestamp(timestamp)` | Convert Z to +00:00 format |

---

## Core Types

### Result<T>

All API functions return a `Result<T>` type - they never throw exceptions.

```typescript
type Result<T> =
  | { data: T; error: null }      // Success
  | { data: null; error: EenError } // Failure

interface EenError {
  code: ErrorCode
  message: string
  status?: number
  details?: unknown
}

type ErrorCode =
  | 'AUTH_REQUIRED'       // No valid token - redirect to login
  | 'AUTH_FAILED'         // Authentication failed
  | 'TOKEN_EXPIRED'       // Token expired - will auto-refresh
  | 'API_ERROR'           // EEN API returned an error
  | 'NETWORK_ERROR'       // Network request failed
  | 'VALIDATION_ERROR'    // Invalid parameters
  | 'NOT_FOUND'           // Resource not found (404)
  | 'FORBIDDEN'           // Access denied (403)
  | 'RATE_LIMITED'        // Too many requests (429)
  | 'SERVICE_UNAVAILABLE' // Service unavailable (503)
  | 'UNKNOWN_ERROR'       // Unexpected error
```

### Pagination Types

```typescript
interface PaginationParams {
  pageSize?: number   // Results per page (default varies, typically 100)
  pageToken?: string  // Token for fetching a specific page
}

interface PaginatedResult<T> {
  results: T[]
  nextPageToken?: string  // Token for next page (undefined if last page)
  prevPageToken?: string  // Token for previous page
  totalSize?: number      // Total count (not always provided)
}
```

---



## Common Patterns

### Error Handling

```typescript
const { data, error } = await getUsers()

if (error) {
  switch (error.code) {
    case 'AUTH_REQUIRED':
      router.push('/login')
      break
    case 'NOT_FOUND':
      showNotFound()
      break
    default:
      showError(error.message)
  }
  return
}

// TypeScript knows data is not null here
processUsers(data.results)
```

### Pagination

```typescript
async function fetchAll<T>(
  fetcher: (params: { pageToken?: string }) => Promise<Result<PaginatedResult<T>>>
): Promise<T[]> {
  const all: T[] = []
  let pageToken: string | undefined

  do {
    const { data, error } = await fetcher({ pageToken })
    if (error) break
    all.push(...data.results)
    pageToken = data.nextPageToken
  } while (pageToken)

  return all
}
```

---

## Anti-Patterns (What NOT to Do)

### DON'T: Use try/catch for API errors

```typescript
// WRONG - functions don't throw
try {
  const users = await getUsers()
} catch (e) {
  // This will never catch API errors!
}

// CORRECT
const { data, error } = await getUsers()
if (error) handleError(error)
```

### DON'T: Ignore the error check

```typescript
// WRONG - data might be null
const { data } = await getUsers()
data.results.forEach(...) // TypeError if error occurred!

// CORRECT
const { data, error } = await getUsers()
if (error) return
data.results.forEach(...) // Safe
```

### DON'T: Call initEenToolkit multiple times

```typescript
// WRONG - calling in component
export default {
  setup() {
    initEenToolkit({ ... }) // Called every time component mounts!
  }
}

// CORRECT - call once in main.ts
initEenToolkit({ ... })
app.mount('#app')
```

---

## External Resources

- [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com)
- [EEN API v3.0 Reference](https://developer.eagleeyenetworks.com/reference/using-the-api)
- [GitHub Repository](https://github.com/klaushofrichter/een-api-toolkit)
- [OAuth Proxy](https://github.com/klaushofrichter/een-oauth-proxy)
