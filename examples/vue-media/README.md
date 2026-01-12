# EEN API Toolkit - Vue Media Example

A Vue 3 example demonstrating how to fetch live images, recorded images, and stream HLS video from EEN cameras using the een-api-toolkit.

![Media Screenshot](media-screenshot.png)

## Storage Strategy: sessionStorage

This example uses the `sessionStorage` storage strategy for balanced security. This means:

- **Per-tab isolation** - each browser tab has its own session
- **Page refresh preserves session** - tokens survive refresh within the same tab
- **Tab close clears session** - closing the tab removes tokens
- **New tabs require login** - opening a new tab requires separate authentication

This is a good balance between security (limiting XSS blast radius) and user experience (page refresh doesn't require re-login).

## Features Demonstrated

- OAuth authentication flow (login, callback, logout)
- Protected routes with navigation guards
- Camera selection with persistence across pages
- Live image viewing with auto-refresh
- Recorded image viewing with prev/next navigation
- HLS video streaming with adaptive bitrate
- Datetime picker with seconds precision
- Shared datetime state across pages

## Pages Overview

### Home Page
The landing page that displays a welcome message and login prompt when not authenticated. Shows the available toolkit functions and their descriptions.

### Live Camera Image
Displays live preview images from the selected camera with automatic refresh every 5 seconds.

**APIs Used:**
- `getCameras()` - Lists available cameras for selection
- `getLiveImage()` - Fetches the current live preview image as base64

**Features:**
- Camera selector dropdown
- Auto-refresh with error recovery (stops after 3 consecutive failures)
- Displays image timestamp

### Recorded Image
Displays recorded images at a specific point in time, showing both preview and main quality images side by side.

**APIs Used:**
- `getCameras()` - Lists available cameras for selection
- `getRecordedImage()` - Fetches recorded images with pagination tokens

**Features:**
- Camera selector dropdown
- Datetime picker with seconds precision
- Previous/Next navigation using pagination tokens
- "Now" button to reset to current time
- Displays both preview and main quality images
- Shows image resolution (e.g., 640x360 for preview, 1920x1080 for main)
- Displays UTC timestamp in EEN API format

### HLS Video
Streams recorded video using HLS (HTTP Live Streaming) protocol with adaptive bitrate support.

**APIs Used:**
- `getCameras()` - Lists available cameras for selection
- `initMediaSession()` - Initializes the media session (required for video URLs)
- `listMedia()` - Retrieves media intervals with HLS URLs
- `useAuthStore()` - Explicitly used to get the token for HLS.js requests (see note below)

**Features:**
- Camera selector dropdown
- Datetime picker with seconds precision
- "Now" button to reset to current time
- "Clip Time" button to set picker to the clip's start time
- Displays segment start/end times with duration
- Shows whether selected time is before, inside, or after the segment
- Uses HLS.js library for cross-browser HLS support
- Adds Authorization header to HLS segment requests

## APIs Used Summary

| API Function | Pages | Purpose |
|--------------|-------|---------|
| `getCameras()` | All media pages | List available cameras |
| `getLiveImage()` | Live Camera Image | Fetch live preview image |
| `getRecordedImage()` | Recorded Image | Fetch recorded images with navigation |
| `initMediaSession()` | HLS Video | Initialize media session for video URLs |
| `listMedia()` | HLS Video | Get media intervals with streaming URLs |
| `useAuthStore()` | All pages | Authentication state management |
| `initEenToolkit()` | App initialization | Configure toolkit settings |

**Note on `useAuthStore()`:** All toolkit functions (`getCameras`, `getLiveImage`, `getRecordedImage`, `listMedia`) use `useAuthStore()` internally to get the authentication token. The HLS Video page is the only one that explicitly calls `useAuthStore()` in its code because HLS.js is a third-party library that makes its own HTTP requests - the token must be manually passed to HLS.js via the `xhrSetup` callback.

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

All commands below should be run from this example directory (`examples/vue-media/`):

2. Copy the environment file:
   ```bash
   # From examples/vue-media/
   cp .env.example .env
   ```

3. Edit `.env` with your EEN credentials:
   ```env
   VITE_EEN_CLIENT_ID=your-client-id
   VITE_PROXY_URL=http://127.0.0.1:8787
   # DO NOT change the redirect URI - EEN IDP only permits this URL
   VITE_REDIRECT_URI=http://127.0.0.1:3333
   ```

4. Install dependencies and start:
   ```bash
   # From examples/vue-media/
   npm install
   npm run dev
   ```

5. Open http://127.0.0.1:3333 in your browser.

**Important:** The EEN Identity Provider only permits `http://127.0.0.1:3333` as the OAuth redirect URI. Do not use `localhost` or other ports.

**Note:** Development and testing was done on macOS. The `npm run stop` command uses `lsof`, which is not available on Windows. Windows users should manually stop any process on port 3333 or use `npx kill-port 3333` instead.

## Project Structure

```
src/
├── main.ts              # App entry, toolkit initialization
├── App.vue              # Root component with navigation
├── router/
│   └── index.ts         # Vue Router with auth guards
├── composables/
│   ├── useSelectedCamera.ts    # Shared camera selection state
│   └── useSelectedDateTime.ts  # Shared datetime state
└── views/
    ├── Home.vue         # Home page with login prompt
    ├── Login.vue        # OAuth login redirect
    ├── Callback.vue     # OAuth callback handler
    ├── LiveCamera.vue   # Live image viewer with auto-refresh
    ├── RecordedImage.vue # Recorded image viewer (preview + main)
    ├── HLS.vue          # HLS video streaming
    └── Logout.vue       # Logout handler
```

## Key Code Examples

### Fetching Live Images (LiveCamera.vue)

```typescript
import { getLiveImage } from 'een-api-toolkit'

async function fetchLiveImage() {
  const result = await getLiveImage({ deviceId: selectedCameraId.value })

  if (result.error) {
    error.value = result.error.message
  } else {
    imageData.value = result.data.imageData
    timestamp.value = result.data.timestamp
  }
}
```

### Fetching Recorded Images (RecordedImage.vue)

Fetches both preview and main quality images for comparison:

```typescript
import { getRecordedImage } from 'een-api-toolkit'

// Fetch preview image
const result = await getRecordedImage({
  deviceId: selectedCameraId.value,
  type: 'preview',
  timestamp__gte: timestamp
})

// Fetch main image at the same timestamp
const mainResult = await getRecordedImage({
  deviceId: selectedCameraId.value,
  type: 'main',
  timestamp__gte: result.data.timestamp
})
```

### Streaming HLS Video (HLS.vue)

```typescript
import { listMedia, initMediaSession, useAuthStore } from 'een-api-toolkit'
import Hls from 'hls.js'

// Initialize media session first
await initMediaSession()

// Get HLS URL from listMedia
const result = await listMedia({
  deviceId: selectedCameraId.value,
  type: 'main',
  mediaType: 'video',
  startTimestamp: timestamp,
  include: ['hlsUrl']
})

// Configure HLS.js with Authorization header
const authStore = useAuthStore()
const hls = new Hls({
  xhrSetup: (xhr: XMLHttpRequest) => {
    xhr.setRequestHeader('Authorization', `Bearer ${authStore.token}`)
  }
})

hls.loadSource(result.data.results[0].hlsUrl)
hls.attachMedia(videoElement)
```

### Displaying Images

The toolkit returns `imageData` as a complete data URL (including the `data:image/jpeg;base64,` prefix), so it can be used directly with `:src`:

```vue
<template>
  <img
    v-if="imageData"
    :src="imageData"
    alt="Camera image"
  />
</template>
```

### Shared State with Composables

Camera selection and datetime are shared across pages using Vue composables:

```typescript
// useSelectedCamera.ts
import { ref } from 'vue'

const selectedCameraId = ref<string | null>(null)

export function useSelectedCamera() {
  return {
    selectedCameraId,
    setSelectedCamera: (id: string) => { selectedCameraId.value = id }
  }
}
```

This allows users to switch between Live Camera, Recorded Image, and HLS Video pages while maintaining their camera and time selection.
