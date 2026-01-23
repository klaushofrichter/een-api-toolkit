# EEN API Toolkit - AI Documentation Restructuring Plan

> **Purpose:** Break the monolithic auto-generated AI-CONTEXT.md (52KB, ~1,844 lines, ~15-18K tokens)
> into focused, domain-specific documents that preserve AI context and enable specialized agents.

---

## Executive Summary

### Current State
- Single auto-generated 52KB document from `scripts/generate-ai-context.ts`
- Consumes ~15-18K tokens regardless of which API the AI needs
- Content is aligned with actual code via generation script
- Existing `docs-accuracy-reviewer` agent validates documentation

### Proposed Solution
Refactor the generation script to produce 7 focused documents:

| Document | Purpose | Est. Lines | Est. Tokens |
|----------|---------|------------|-------------|
| **AI-CONTEXT.md** | Overview, navigation, core types | ~400 | ~3K |
| **AI-SETUP.md** | Vue 3 app scaffolding, Pinia, Vite | ~350 | ~2.5K |
| **AI-AUTH.md** | OAuth flow, token management | ~300 | ~2K |
| **AI-USERS.md** | User API types and functions | ~200 | ~1.5K |
| **AI-DEVICES.md** | Cameras + Bridges APIs | ~400 | ~3K |
| **AI-MEDIA.md** | Media, Feeds, Live Video, HLS | ~500 | ~4K |
| **AI-EVENTS.md** | Events, Alerts, Metrics, Subscriptions | ~450 | ~3.5K |

### Benefits

| Metric | Before | After (typical task) | Improvement |
|--------|--------|---------------------|-------------|
| Tokens per task | ~15-18K | ~5-8K | 55-70% reduction |
| Remaining context | Limited | Substantial | More room for code |
| Agent specialization | None | 6 domain agents | New capability |

---

## Current Generation Script Analysis

The existing `scripts/generate-ai-context.ts` uses helper functions:

```typescript
// Current structure - all concatenated into single file
const content = [
  generateHeader(),
  generateCriticalSetup(),        // Prerequisites, installation, common errors
  generateQuickReference(),       // Function tables
  generateCoreTypes(),            // Result<T>, EenError, pagination
  generateEntityTypes(),          // User, Camera, Bridge, Media, Event types
  generateAPIReference(),         // Function documentation
  generateUtilities(),            // formatTimestamp
  generateLiveVideoStreaming(),   // Preview/Main streams, Live SDK
  generateHlsTroubleshooting(),   // HLS playback issues
  generatePatterns(),             // Error handling, pagination, auth guard
  generateAntiPatterns(),         // What NOT to do
  generateExternalResources()     // Links
].join('')
```

**Refactoring approach:** Split these functions into domain-specific generators that write to separate files while maintaining a shared header/version mechanism.

---

## New File Structure

```
docs/
├── AI-CONTEXT.md                # Overview + navigation (entry point)
├── ai-reference/
│   ├── AI-SETUP.md              # Vue 3 project setup
│   ├── AI-AUTH.md               # Authentication
│   ├── AI-USERS.md              # Users API
│   ├── AI-DEVICES.md            # Cameras + Bridges
│   ├── AI-MEDIA.md              # Media + Feeds + Video
│   └── AI-EVENTS.md             # Events + Alerts + Metrics + SSE
├── guides/
│   └── HLS-VIDEO-TROUBLESHOOTING.md  # (existing)
└── DOCUMENTATION-RESTRUCTURE-PLAN.md # (this file, remove after implementation)

.claude/agents/
├── docs-accuracy-reviewer.md    # (existing)
├── test-runner.md               # (existing)
├── een-setup-agent.md           # NEW
├── een-auth-agent.md            # NEW
├── een-users-agent.md           # NEW
├── een-devices-agent.md         # NEW
├── een-media-agent.md           # NEW
└── een-events-agent.md          # NEW
```

---

## Document Content Mapping

### AI-CONTEXT.md (Overview)

**Source functions to include:**
- `generateHeader()` - Modified for overview focus
- Condensed `generateQuickReference()` - Tables only, no detailed signatures
- `generateCoreTypes()` - Result<T>, EenError, PaginationParams
- Condensed `generatePatterns()` - Brief examples
- `generateAntiPatterns()` - Keep as-is
- `generateExternalResources()` - Keep as-is

**New content:**
- Document navigation table
- "Which document to load" decision tree
- Cross-reference links to domain docs

**Example apps:** None (references all)

---

### AI-SETUP.md (Vue 3 Application Setup)

**Source functions to extract from:**
- `generateCriticalSetup()` - Prerequisites, installation, main.ts template
- Common errors section (Pinia, redirect URI)
- Vite configuration

**New content:**
- Complete main.ts template with annotations
- vite.config.ts template
- Router setup template with OAuth callback
- Project structure reference
- Environment variables (.env template)

**Example apps:** All examples share this setup pattern

---

### AI-AUTH.md (Authentication)

**Source functions to extract from:**
- Auth functions from `generateQuickReference()`
- Auth examples from `generateAPIReference()` (getAuthUrl, handleAuthCallback, etc.)
- Auth guard from `generatePatterns()`

**New content:**
- useAuthStore() state and computed properties
- Complete Login.vue, Logout.vue, Callback.vue templates
- Token lifecycle explanation
- Storage strategies
- Auto-refresh behavior

**Example apps:** All examples (auth is universal)

---

### AI-USERS.md (Users API)

**Source functions to extract from:**
- User types from `generateEntityTypes()`
- User functions from `generateQuickReference()` and `generateAPIReference()`

**Content:**
- User and UserProfile interfaces
- ListUsersParams, GetUserParams
- getCurrentUser(), getUsers(), getUser() with examples
- Pagination example for users
- Complete Vue component example

**Example app:** `examples/vue-users/`

---

### AI-DEVICES.md (Cameras & Bridges)

**Source functions to extract from:**
- Camera types from `generateEntityTypes()`
- Bridge types from `generateEntityTypes()`
- Camera/Bridge functions from `generateQuickReference()` and `generateAPIReference()`

**Content:**
- Camera, CameraStatus, CameraDeviceInfo interfaces
- Bridge, BridgeStatus, BridgeNetworkInfo interfaces
- ListCamerasParams, GetCameraParams, ListBridgesParams, GetBridgeParams
- Filter patterns (status__in, tags__contains, q)
- getCameras(), getCamera(), getBridges(), getBridge() with examples

**Example apps:** `examples/vue-cameras/`, `examples/vue-bridges/`

---

### AI-MEDIA.md (Media, Feeds & Live Video)

**Source functions to extract from:**
- Media types from `generateEntityTypes()`
- Feed types from `generateEntityTypes()`
- Media functions from `generateQuickReference()` and `generateAPIReference()`
- `generateLiveVideoStreaming()` - Complete section
- `generateHlsTroubleshooting()` - Complete section
- Common Pitfalls - Preview Images from `generateCriticalSetup()`
- Choosing the Right Preview Method from `generateCriticalSetup()`

**Content:**
- MediaInterval, ListMediaParams, LiveImageResult, RecordedImageResult
- Feed, ListFeedsParams, ListFeedsResult
- MediaSessionResponse, MediaSessionResult
- listMedia(), getLiveImage(), getRecordedImage(), initMediaSession(), listFeeds()
- Preview vs Main stream comparison
- Live Video SDK integration (complete Vue example)
- HLS.js configuration with auth
- formatTimestamp() utility (from `generateUtilities()`)

**Example apps:** `examples/vue-media/`, `examples/vue-feeds/`

---

### AI-EVENTS.md (Events, Alerts, Metrics & Subscriptions)

**Source functions to extract from:**
- Event types from `generateEntityTypes()`
- EventMetric types from `generateEntityTypes()`
- Alert types from `generateEntityTypes()`
- Notification types from `generateEntityTypes()`
- EventSubscription types (need to add to generation script)
- Event/Alert/Notification functions from `generateQuickReference()` and `generateAPIReference()`

**Content:**
- Event, EventData, EventType, EventFieldValues, ListEventsParams
- EventMetric, MetricDataPoint, GetEventMetricsParams
- Alert, AlertAction, AlertType, ListAlertsParams
- Notification, NotificationCategory, NotificationStatus, ListNotificationsParams
- EventSubscription, SSEConnection, SSEEvent, CreateEventSubscriptionParams
- All event/alert/notification/subscription functions with examples
- SSE connection lifecycle
- Chart.js integration pattern for metrics

**Example apps:** `examples/vue-events/`, `examples/vue-alerts-metrics/`, `examples/vue-event-subscriptions/`

---

## Refactored Generation Script Design

```typescript
// scripts/generate-ai-context.ts (refactored)

interface GeneratorConfig {
  outputDir: string
  version: string
}

// Shared utilities
function generateVersionHeader(title: string, version: string): string { ... }
function generateNavigation(): string { ... }
function generateCrossReferences(doc: string): string { ... }

// Domain-specific generators
function generateOverview(config: GeneratorConfig): void {
  const content = [
    generateVersionHeader('EEN API Toolkit - AI Reference', config.version),
    generateNavigationTable(),
    generateCoreTypes(),
    generateCondensedPatterns(),
    generateAntiPatterns(),
    generateExternalResources()
  ].join('')

  fs.writeFileSync(path.join(config.outputDir, 'AI-CONTEXT.md'), content)
}

function generateSetupDoc(config: GeneratorConfig): void {
  const content = [
    generateVersionHeader('Vue 3 Application Setup', config.version),
    generatePrerequisites(),
    generateInstallation(),
    generateMainTsTemplate(),
    generateViteConfig(),
    generateRouterSetup(),
    generateEnvVariables(),
    generateSetupErrors(),
    generateCrossReferences('AI-AUTH.md')
  ].join('')

  fs.writeFileSync(path.join(config.outputDir, 'ai-reference/AI-SETUP.md'), content)
}

function generateAuthDoc(config: GeneratorConfig): void { ... }
function generateUsersDoc(config: GeneratorConfig): void { ... }
function generateDevicesDoc(config: GeneratorConfig): void { ... }
function generateMediaDoc(config: GeneratorConfig): void { ... }
function generateEventsDoc(config: GeneratorConfig): void { ... }

function main() {
  const config: GeneratorConfig = {
    outputDir: DOCS_DIR,
    version: packageJson.version
  }

  // Ensure directories exist
  fs.mkdirSync(path.join(config.outputDir, 'ai-reference'), { recursive: true })

  // Generate all documents
  generateOverview(config)
  generateSetupDoc(config)
  generateAuthDoc(config)
  generateUsersDoc(config)
  generateDevicesDoc(config)
  generateMediaDoc(config)
  generateEventsDoc(config)

  console.log(`Generated AI documentation (v${config.version})`)
}
```

---

## Agent Definitions

### Format (matching existing agents)

```markdown
---
name: een-[domain]-agent
description: |
  [When to use this agent description]
model: inherit
color: [color]
---

[System prompt with capabilities, workflow, constraints]
```

### een-setup-agent.md

```markdown
---
name: een-setup-agent
description: |
  Use this agent when creating a new Vue 3 application with een-api-toolkit,
  when fixing Pinia initialization errors, when troubleshooting OAuth redirect
  URI issues, or when setting up Vite configuration for EEN applications.
model: inherit
color: green
---

You are an expert in scaffolding Vue 3 applications with the een-api-toolkit.

## Context Files
Load these documentation files before starting:
- docs/AI-CONTEXT.md (overview)
- docs/ai-reference/AI-SETUP.md (primary reference)

## Your Capabilities
1. Create new Vue 3 project structure for EEN applications
2. Configure main.ts with proper Pinia + toolkit initialization
3. Set up vite.config.ts for EEN requirements (127.0.0.1:3333)
4. Configure Vue Router with OAuth callback handling
5. Set up environment variables
6. Debug common setup errors (Pinia not active, redirect URI mismatch)

## Workflow
1. Verify prerequisites (Node 20+, Vue 3, Pinia)
2. Create or modify configuration files
3. Set up router with OAuth callback pattern
4. Verify setup by checking for common errors
5. Reference examples/vue-users/ for working patterns

## Constraints
- Always use 127.0.0.1, never localhost
- Always use port 3333
- Pinia must be installed before initEenToolkit()
- Never add trailing slashes to redirect URIs
```

### een-auth-agent.md

```markdown
---
name: een-auth-agent
description: |
  Use this agent when implementing OAuth login/logout flows, handling auth
  callbacks, setting up route guards, managing token refresh, or debugging
  authentication issues with the een-api-toolkit.
model: inherit
color: blue
---

You are an expert in OAuth authentication with the een-api-toolkit.

## Context Files
- docs/AI-CONTEXT.md (overview)
- docs/ai-reference/AI-AUTH.md (primary reference)

## Your Capabilities
1. Implement OAuth login flow with getAuthUrl()
2. Handle OAuth callbacks with handleAuthCallback()
3. Set up Vue Router auth guards
4. Manage token refresh and revocation
5. Configure storage strategies (localStorage, sessionStorage, memory)
6. Debug authentication errors

## Key Functions
- getAuthUrl(): Generate OAuth URL for login redirect
- handleAuthCallback(code, state): Exchange auth code for tokens
- refreshToken(): Manually refresh access token
- revokeToken(): Logout and clear tokens
- useAuthStore(): Access auth state (token, isAuthenticated, baseUrl)

## Constraints
- Never expose refresh tokens to client code
- Handle AUTH_REQUIRED errors by redirecting to login
- Use exact redirect URI: http://127.0.0.1:3333
```

### een-users-agent.md

```markdown
---
name: een-users-agent
description: |
  Use this agent when working with user management: listing users, getting
  user details, displaying current user profile, or implementing user-related
  features with the een-api-toolkit.
model: inherit
color: cyan
---

You are an expert in user management with the een-api-toolkit.

## Context Files
- docs/AI-CONTEXT.md (overview)
- docs/ai-reference/AI-AUTH.md (auth is required)
- docs/ai-reference/AI-USERS.md (primary reference)

## Reference Example
- examples/vue-users/

## Your Capabilities
1. List and paginate users with getUsers()
2. Get current user profile with getCurrentUser()
3. Get specific user details with getUser()
4. Implement user permission checks
5. Handle NOT_FOUND errors for missing users

## Key Types
- User: Full user object with optional fields
- UserProfile: Current user's profile (from /users/self)
- ListUsersParams: Pagination and include options
```

### een-devices-agent.md

```markdown
---
name: een-devices-agent
description: |
  Use this agent when working with cameras or bridges: listing devices,
  filtering by status, getting device details, or implementing device
  selection UI with the een-api-toolkit.
model: inherit
color: orange
---

You are an expert in camera and bridge management with the een-api-toolkit.

## Context Files
- docs/AI-CONTEXT.md (overview)
- docs/ai-reference/AI-AUTH.md (auth is required)
- docs/ai-reference/AI-DEVICES.md (primary reference)

## Reference Examples
- examples/vue-cameras/
- examples/vue-bridges/

## Your Capabilities
1. List and filter cameras with getCameras()
2. List and filter bridges with getBridges()
3. Get device details with getCamera() / getBridge()
4. Implement status filtering (online, offline, etc.)
5. Implement tag-based filtering
6. Full-text search with q parameter

## Key Filter Patterns
- status__in: ['online', 'streaming'] - Include specific statuses
- status__ne: 'offline' - Exclude a status
- tags__contains: ['outdoor'] - All tags must match
- tags__any: ['floor1', 'floor2'] - Any tag matches
- q: 'front door' - Full-text search
```

### een-media-agent.md

```markdown
---
name: een-media-agent
description: |
  Use this agent when implementing live video, camera previews, recorded
  images, HLS playback, or any media-related features with the een-api-toolkit.
  This includes troubleshooting video display issues.
model: inherit
color: red
---

You are an expert in media and video streaming with the een-api-toolkit.

## Context Files
- docs/AI-CONTEXT.md (overview)
- docs/ai-reference/AI-AUTH.md (auth is required)
- docs/ai-reference/AI-DEVICES.md (camera context)
- docs/ai-reference/AI-MEDIA.md (primary reference)

## Reference Examples
- examples/vue-media/ (LiveCamera, RecordedImage, HLS)
- examples/vue-feeds/ (Preview and Main streams)

## Your Capabilities
1. Display live camera previews with getLiveImage()
2. Set up MJPEG streams with multipartUrl
3. Implement full-resolution video with Live Video SDK
4. Play recorded video via HLS
5. Navigate recorded images with getRecordedImage()
6. Initialize media sessions for cookie-based auth

## Critical Rules
- NEVER construct API URLs directly for <img> tags
- NEVER modify multipartUrl with query parameters
- USE getLiveImage() for thumbnails (handles auth internally)
- USE initMediaSession() before using multipartUrl
- USE formatTimestamp() for EEN API timestamps (+00:00 format)

## Choosing Preview Method
| Use Case | Method |
|----------|--------|
| Grid of 20+ cameras | getLiveImage() |
| Auto-updating previews | multipartUrl + initMediaSession() |
| Full-quality video | Live Video SDK |
| Recorded video | HLS via listMedia() |
```

### een-events-agent.md

```markdown
---
name: een-events-agent
description: |
  Use this agent when working with events, alerts, metrics, notifications,
  or real-time SSE subscriptions with the een-api-toolkit. This includes
  event visualization and Chart.js integration for metrics.
model: inherit
color: purple
---

You are an expert in events and real-time streaming with the een-api-toolkit.

## Context Files
- docs/AI-CONTEXT.md (overview)
- docs/ai-reference/AI-AUTH.md (auth is required)
- docs/ai-reference/AI-DEVICES.md (events are per-camera)
- docs/ai-reference/AI-EVENTS.md (primary reference)

## Reference Examples
- examples/vue-events/ (Event listing with bounding boxes)
- examples/vue-alerts-metrics/ (Metrics chart, alerts, notifications)
- examples/vue-event-subscriptions/ (SSE real-time streaming)

## Your Capabilities
1. Query events with listEvents()
2. Display event bounding boxes from SVG overlays
3. Visualize event metrics with getEventMetrics()
4. List and filter alerts with listAlerts()
5. List notifications with listNotifications()
6. Create SSE subscriptions with createEventSubscription()
7. Connect to real-time streams with connectToEventSubscription()

## Actor Format
Events are queried by actor: `camera:{cameraId}`

## SSE Lifecycle
1. createEventSubscription() - Get subscription with sseUrl
2. connectToEventSubscription(sseUrl, options) - Connect to stream
3. Handle events via onEvent callback
4. deleteEventSubscription(id) - Cleanup when done
```

---

## Context Loading Scenarios

| User Task | Documents to Load | Tokens | vs Current |
|-----------|------------------|--------|------------|
| New project setup | AI-CONTEXT + AI-SETUP | ~5.5K | 65% savings |
| Implement login | AI-CONTEXT + AI-AUTH | ~5K | 70% savings |
| Add user list | AI-CONTEXT + AI-AUTH + AI-USERS | ~6.5K | 60% savings |
| Camera grid | AI-CONTEXT + AI-DEVICES + AI-MEDIA | ~10K | 40% savings |
| Live video player | AI-CONTEXT + AI-AUTH + AI-MEDIA | ~9K | 45% savings |
| Events dashboard | AI-CONTEXT + AI-EVENTS | ~6.5K | 60% savings |
| Full app (all features) | All documents | ~19.5K | ~same |

---

## Implementation Phases

### Phase 1: Directory Setup
1. Create `docs/ai-reference/` directory
2. Create placeholder files with headers

### Phase 2: Refactor Generation Script
1. Extract shared utilities (header, cross-references)
2. Split existing functions into domain generators
3. Add domain-specific content
4. Generate all files with single `npm run docs:ai-context`

### Phase 3: Create Agent Definitions
1. Create `.claude/agents/een-*-agent.md` files
2. Test each agent with representative tasks

### Phase 4: Validation
1. Run `docs-accuracy-reviewer` agent on all generated files
2. Verify cross-references work
3. Test context loading scenarios
4. Measure actual token usage

### Phase 5: Cleanup
1. Update CLAUDE.md to reference new structure
2. Remove this plan document
3. Update npm scripts documentation

---

## npm Scripts

```json
{
  "scripts": {
    "docs:ai-context": "npx tsx scripts/generate-ai-context.ts",
    "docs:ai-context:single": "npx tsx scripts/generate-ai-context.ts --single"
  }
}
```

The `--single` flag would generate the original monolithic file for backward compatibility.

---

## Validation with docs-accuracy-reviewer

After generation, the existing `docs-accuracy-reviewer` agent should verify:
1. All type definitions match `src/types/`
2. All function signatures match `src/*/service.ts` exports
3. All code examples use current APIs
4. Cross-references between documents are valid
5. Example app references point to existing files

---

## Decisions Made

1. **Default mode:** Split is default
   - `npm run docs:ai-context` generates 7 files (overview + 6 domain docs)
   - `npm run docs:ai-context --single` generates legacy monolithic file

2. **Agent distribution:** Include in npm package
   - Agents will be at `node_modules/een-api-toolkit/.claude/agents/`
   - Users can copy or reference these agents directly
   - Requires adding `.claude/` to the `files` array in `package.json`

3. **Example extraction:** Extract from actual example apps
   - Generation script reads Vue components from `examples/vue-*/src/`
   - Example apps are the source of truth for code snippets
   - Ensures documentation stays in sync with working code

---

## Updated Package Configuration

```json
// package.json additions
{
  "files": [
    "dist",
    "examples",
    ".claude/agents"
  ]
}
```

---

## Example Extraction Strategy

The generation script will extract code from specific files:

| Document | Example Source Files |
|----------|---------------------|
| AI-SETUP.md | `examples/vue-users/src/main.ts`, `vite.config.ts`, `router/index.ts` |
| AI-AUTH.md | `examples/vue-users/src/views/Login.vue`, `Callback.vue`, `Logout.vue` |
| AI-USERS.md | `examples/vue-users/src/views/Users.vue` |
| AI-DEVICES.md | `examples/vue-cameras/src/views/Cameras.vue`, `examples/vue-bridges/src/views/Bridges.vue` |
| AI-MEDIA.md | `examples/vue-media/src/views/LiveCamera.vue`, `examples/vue-feeds/src/views/Feeds.vue` |
| AI-EVENTS.md | `examples/vue-events/src/components/EventsModal.vue`, `examples/vue-alerts-metrics/src/components/MetricsChart.vue`, `examples/vue-event-subscriptions/src/views/LiveEvents.vue` |

Extraction approach:
```typescript
function extractVueScript(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8')
  const match = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  return match ? match[1].trim() : ''
}

function extractVueTemplate(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8')
  const match = content.match(/<template>([\s\S]*?)<\/template>/)
  return match ? match[1].trim() : ''
}
```

---

## Next Steps

1. **Phase 1:** Create directory structure and placeholder files
2. **Phase 2:** Refactor generation script with example extraction
3. **Phase 3:** Create agent definition files
4. **Phase 4:** Update package.json to include agents
5. **Phase 5:** Validate with docs-accuracy-reviewer
6. **Phase 6:** Test agents with representative tasks
