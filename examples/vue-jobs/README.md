# EEN API Toolkit - Vue Jobs Example

A complete example showing how to use the Jobs, Files, and Exports APIs from the een-api-toolkit in a Vue 3 application.

## Storage Strategy: Memory

This example uses the `memory` storage strategy for maximum security. This means:

- **Tokens are never written to disk** - immune to localStorage/sessionStorage XSS attacks
- **Page refresh requires re-authentication** - tokens exist only in memory
- **Each tab is independent** - opening a new tab requires separate login

This is the recommended strategy for high-security deployments where protecting against XSS token theft is critical.

## Features Demonstrated

- OAuth authentication flow (login, callback, logout)
- Protected routes with navigation guards
- List jobs with state filtering (pending, started, success, failure)
- View job details with real-time progress polling
- Create video exports from cameras
- List and download files
- Error handling with Result pattern
- Reactive authentication state

## APIs Used

- `listJobs()` - List jobs with filtering and pagination
- `getJob()` - Get single job details
- `createExportJob()` - Create video export job
- `listFiles()` - List files with pagination
- `downloadFile()` - Download file content
- `getCameras()` - Get cameras for export selection
- `useAuthStore()` - Authentication state management
- `getAuthUrl()` - Generate OAuth login URL
- `handleAuthCallback()` - Process OAuth callback
- `initEenToolkit()` - Toolkit initialization

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

All commands below should be run from this example directory (`examples/vue-jobs/`):

2. Copy the environment file:
   ```bash
   # From examples/vue-jobs/
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
   # From examples/vue-jobs/
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
    ├── Home.vue       # Home page with user profile
    ├── Login.vue      # OAuth login redirect
    ├── Callback.vue   # OAuth callback handler
    ├── Jobs.vue       # Job list with state filters
    ├── JobDetail.vue  # Single job with progress polling
    ├── Files.vue      # File browser with download
    ├── CreateExport.vue # Export creation form
    └── Logout.vue     # Logout handler
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

### Listing Jobs with State Filtering (Jobs.vue)

```typescript
import { ref } from 'vue'
import { listJobs, type Job, type JobState, type ListJobsParams } from 'een-api-toolkit'

const jobs = ref<Job[]>([])
const selectedStates = ref<JobState[]>([])

async function fetchJobs(params: ListJobsParams) {
  const mergedParams: ListJobsParams = { ...params }
  if (selectedStates.value.length > 0) {
    mergedParams.state__in = selectedStates.value
  }

  const result = await listJobs(mergedParams)
  if (result.error) {
    // Handle error
  } else {
    jobs.value = result.data.results
  }
}
```

### Polling Job Progress (JobDetail.vue)

```typescript
import { ref, onMounted, onUnmounted } from 'vue'
import { getJob, type Job } from 'een-api-toolkit'

const job = ref<Job | null>(null)
let pollInterval: ReturnType<typeof setInterval> | null = null

async function fetchJob(jobId: string) {
  const result = await getJob(jobId)
  if (result.error) {
    // Handle error
  } else {
    job.value = result.data

    // Auto-start polling if job is in progress
    if (['pending', 'started'].includes(result.data.state)) {
      startPolling()
    } else {
      stopPolling()
    }
  }
}

function startPolling() {
  if (pollInterval) return
  pollInterval = setInterval(() => fetchJob(jobId), 3000)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

onUnmounted(() => stopPolling())
```

### Creating an Export (CreateExport.vue)

```typescript
import { createExportJob, formatTimestamp, type ExportType } from 'een-api-toolkit'

async function handleSubmit() {
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - duration.value * 60 * 1000)

  const result = await createExportJob({
    name: exportName.value || `Export - ${new Date().toLocaleString()}`,
    type: exportType.value,
    cameraId: selectedCamera.value,
    startTimestamp: formatTimestamp(startTime.toISOString()),
    endTimestamp: formatTimestamp(endTime.toISOString())
  })

  if (result.error) {
    // Handle error
  } else {
    // Navigate to job detail page
    router.push(`/jobs/${result.data.id}`)
  }
}
```

### Downloading Files (Files.vue)

```typescript
import { downloadFile, type EenFile } from 'een-api-toolkit'

async function handleDownload(file: EenFile) {
  const result = await downloadFile(file.id)

  if (result.error) {
    // Handle error
  } else {
    // Create download link
    const url = URL.createObjectURL(result.data.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.data.filename || file.name
    a.click()
    URL.revokeObjectURL(url)
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
