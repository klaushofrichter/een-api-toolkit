# HLS Video Playback Troubleshooting

This guide helps developers troubleshoot issues when implementing HLS (HTTP Live Streaming) video playback using the een-api-toolkit.

## Table of Contents

- [Overview](#overview)
- [API Call Sequence](#api-call-sequence)
- [Common Issues](#common-issues)
  - [401 Unauthorized Error](#401-unauthorized-error)
  - [No Video Available for Timestamp](#no-video-available-for-timestamp)
  - [Timestamp Format Errors](#timestamp-format-errors)
  - [HLS Not Available](#hls-not-available)
- [Complete Implementation Example](#complete-implementation-example)

## Overview

HLS video playback from the EEN API requires several steps:

1. **Initialize media session** - Sets up authentication for media access
2. **Find recording intervals** - Query `listMedia` to find recordings containing your target timestamp
3. **Extract HLS URL** - Get the `hlsUrl` from the matching interval
4. **Configure HLS.js with authentication** - Set up the player with Bearer token authentication

### Key Requirements

| Requirement | Details |
|-------------|---------|
| Feed Type | HLS is only available for `main` feeds, not `preview` |
| Timestamp Format | EEN API requires `+00:00` format, not `Z` suffix |
| Authentication | HLS.js requires Authorization header with Bearer token |
| Recording Coverage | The target timestamp must fall within a recording interval |
| Browser Support | HLS.js required (Chrome, Firefox, Edge). Safari's native HLS cannot send auth headers. |

## API Call Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. initMediaSession()                                           │
│    └─ Initializes cookie-based media session                    │
├─────────────────────────────────────────────────────────────────┤
│ 2. listMedia({                                                  │
│      deviceId: cameraId,                                        │
│      type: 'main',           // HLS only available for 'main'   │
│      mediaType: 'video',                                        │
│      startTimestamp: ...,    // Search range start              │
│      endTimestamp: ...,      // Search range end                │
│      include: ['hlsUrl']     // Request HLS URL in response     │
│    })                                                           │
│    └─ Returns array of recording intervals with hlsUrl          │
├─────────────────────────────────────────────────────────────────┤
│ 3. Find interval containing target timestamp                         │
│    └─ interval.startTimestamp <= targetTime <= interval.endTimestamp │
├─────────────────────────────────────────────────────────────────┤
│ 4. Initialize HLS.js with Authorization header                  │
│    └─ hls.loadSource(interval.hlsUrl)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Common Issues

### 401 Unauthorized Error

**Symptom:** HLS.js reports `networkError` with `manifestLoadError` and the network shows 401 status.

**Cause:** HLS.js is not sending the Authorization header with requests. Using `withCredentials: true` (cookie-based auth) does not work for HLS requests.

**Solution:** Configure HLS.js to send the Bearer token in the Authorization header:

```typescript
import Hls from 'hls.js'
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()

const hls = new Hls({
  xhrSetup: function(xhr) {
    xhr.setRequestHeader('Authorization', `Bearer ${authStore.token}`)
  }
})

hls.loadSource(hlsUrl)
hls.attachMedia(videoElement)
```

**Common Mistake:**

```typescript
// WRONG - withCredentials sends cookies but HLS needs Bearer token
const hls = new Hls({
  xhrSetup: function(xhr) {
    xhr.withCredentials = true  // This will NOT work
  }
})
```

### No Video Available for Timestamp

**Symptom:** `listMedia` returns results but none contain the target timestamp, or returns empty results.

**Possible Causes:**

1. **Search range too narrow:** Recording intervals start before the event/alert timestamp
2. **Wrong feed type:** Using `preview` instead of `main`
3. **No recording exists:** Camera wasn't recording at that time

**Solution:** Search a wider time range around the target timestamp:

```typescript
import { listMedia, formatTimestamp } from 'een-api-toolkit'

const targetTime = new Date(alertTimestamp)

// Search 1 hour before and after the target time
const searchStart = new Date(targetTime.getTime() - 60 * 60 * 1000)
const searchEnd = new Date(targetTime.getTime() + 60 * 60 * 1000)

const result = await listMedia({
  deviceId: cameraId,
  type: 'main',              // Must be 'main' for HLS
  mediaType: 'video',
  startTimestamp: formatTimestamp(searchStart.toISOString()),
  endTimestamp: formatTimestamp(searchEnd.toISOString()),
  include: ['hlsUrl']
})

// Find interval that contains the target timestamp
const intervals = result.data?.results ?? []
const targetTimeMs = targetTime.getTime()

const matchingInterval = intervals.find(interval => {
  if (!interval.hlsUrl) return false
  const start = new Date(interval.startTimestamp).getTime()
  const end = new Date(interval.endTimestamp).getTime()
  return targetTimeMs >= start && targetTimeMs <= end
})
```

**Understanding Recording Intervals:**

```
Timeline:  ──────|═══════════════════════════════|────────────────
                 ^                               ^
           interval.startTimestamp         interval.endTimestamp
                       ▲
                  Alert occurs here
                  (inside the interval)
```

The alert/event timestamp typically falls *within* an existing recording interval, not at its start. Search backward from the event time to find the interval.

### Timestamp Format Errors

**Symptom:** API returns error: `Could not parse value for parameter 'startTimestamp__gte'`

**Cause:** JavaScript's `toISOString()` produces timestamps with `Z` suffix, but EEN API requires `+00:00` format.

**Solution:** Use the `formatTimestamp` utility:

```typescript
import { formatTimestamp } from 'een-api-toolkit'

// WRONG - Z suffix not accepted
const timestamp = new Date().toISOString()
// Returns: "2025-01-15T22:30:00.000Z"

// CORRECT - use formatTimestamp
const timestamp = formatTimestamp(new Date().toISOString())
// Returns: "2025-01-15T22:30:00.000+00:00"
```

### HLS Not Available

**Symptom:** `listMedia` returns intervals but `hlsUrl` is null or undefined.

**Possible Causes:**

1. **Using `preview` type:** HLS is only available for `main` feeds
2. **Missing `include` parameter:** HLS URL must be explicitly requested
3. **Account/camera limitations:** HLS may not be available for all accounts

**Solution:**

```typescript
const result = await listMedia({
  deviceId: cameraId,
  type: 'main',              // MUST be 'main', not 'preview'
  mediaType: 'video',
  startTimestamp: formatTimestamp(start.toISOString()),
  endTimestamp: formatTimestamp(end.toISOString()),
  include: ['hlsUrl']        // MUST include 'hlsUrl'
})

// Check if HLS is available
const intervals = result.data?.results ?? []
const hasHls = intervals.some(i => i.hlsUrl)

if (!hasHls) {
  console.log('HLS not available for this camera/time range')
}
```

## Complete Implementation Example

Here's a complete Vue 3 implementation for playing HLS video from an alert timestamp:

```typescript
import { ref, onUnmounted } from 'vue'
import Hls from 'hls.js'
import {
  listMedia,
  initMediaSession,
  formatTimestamp,
  useAuthStore
} from 'een-api-toolkit'

const authStore = useAuthStore()
const videoRef = ref<HTMLVideoElement | null>(null)
const videoUrl = ref<string | null>(null)
const videoError = ref<string | null>(null)
const loadingVideo = ref(false)

let hlsInstance: Hls | null = null

function destroyHls() {
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
}

async function playVideoAtTimestamp(deviceId: string, timestamp: string) {
  loadingVideo.value = true
  videoError.value = null
  videoUrl.value = null

  // Step 1: Initialize media session
  const sessionResult = await initMediaSession()
  if (sessionResult.error) {
    videoError.value = `Media session error: ${sessionResult.error.message}`
    loadingVideo.value = false
    return
  }

  // Step 2: Search for recordings around the target time
  const targetTime = new Date(timestamp)
  const searchStart = new Date(targetTime.getTime() - 60 * 60 * 1000) // 1 hour before
  const searchEnd = new Date(targetTime.getTime() + 60 * 60 * 1000)   // 1 hour after

  const result = await listMedia({
    deviceId: deviceId,
    type: 'main',           // HLS only available for 'main'
    mediaType: 'video',
    startTimestamp: formatTimestamp(searchStart.toISOString()),
    endTimestamp: formatTimestamp(searchEnd.toISOString()),
    include: ['hlsUrl']
  })

  if (result.error) {
    videoError.value = result.error.message
    loadingVideo.value = false
    return
  }

  // Step 3: Find interval containing the target timestamp
  const intervals = result.data?.results ?? []
  const targetTimeMs = targetTime.getTime()

  const interval = intervals.find(i => {
    if (!i.hlsUrl) return false
    const start = new Date(i.startTimestamp).getTime()
    const end = new Date(i.endTimestamp).getTime()
    return targetTimeMs >= start && targetTimeMs <= end
  })

  if (!interval?.hlsUrl) {
    if (intervals.length === 0) {
      videoError.value = 'No recordings found for this time range'
    } else if (!intervals.some(i => i.hlsUrl)) {
      videoError.value = 'Recordings found but HLS not available'
    } else {
      videoError.value = `No recording contains timestamp ${timestamp}`
    }
    loadingVideo.value = false
    return
  }

  videoUrl.value = interval.hlsUrl
  loadingVideo.value = false

  // Step 4: Initialize HLS.js with authentication
  initHls()
}

function initHls() {
  if (!videoUrl.value || !videoRef.value) return

  destroyHls()

  // IMPORTANT: Always use HLS.js, even on Safari
  // Native HLS (Safari's built-in player) cannot send Authorization headers,
  // which means it will get 401 errors when trying to access EEN streams.
  // HLS.js uses XHR requests which allow us to add custom headers.
  if (!Hls.isSupported()) {
    videoError.value = 'HLS is not supported in this browser. Please use Chrome, Firefox, or Edge.'
    return
  }

  // Configure HLS.js with Authorization header
  hlsInstance = new Hls({
    xhrSetup: function(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${authStore.token}`)
    }
  })

  hlsInstance.loadSource(videoUrl.value)
  hlsInstance.attachMedia(videoRef.value)

  hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
    videoRef.value?.play().catch(() => {
      // Autoplay may be blocked by browser
    })
  })

  hlsInstance.on(Hls.Events.ERROR, (_, data) => {
    if (data.fatal) {
      videoError.value = `HLS error: ${data.type} - ${data.details}`
    }
  })
}

// Cleanup on unmount
onUnmounted(() => {
  destroyHls()
})
```

**Template:**

```vue
<template>
  <div class="video-container">
    <div v-if="loadingVideo">Loading video...</div>
    <div v-else-if="videoError" class="error">{{ videoError }}</div>
    <video
      v-else-if="videoUrl"
      ref="videoRef"
      controls
      autoplay
      muted
      playsinline
    />
  </div>
</template>
```

## See Also

- [User Guide - Live Video Streaming](../USER-GUIDE.md#live-video-streaming)
- [vue-media example](../../examples/vue-media/) - Complete example with HLS playback
- [vue-alerts-metrics example](../../examples/vue-alerts-metrics/) - Video playback from alerts
