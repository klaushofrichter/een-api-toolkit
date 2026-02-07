# Jobs, Exports, Files & Downloads - EEN API Toolkit

> **Version:** 0.3.59
>
> Complete reference for async jobs, video exports, and file management.
> Load this document when implementing export workflows or file downloads.

---

## Overview

| Concept | Description |
|---------|-------------|
| **Export Jobs** | Create video/timelapse exports from camera recordings |
| **Jobs** | Track async job progress (pending, started, success, failure) |
| **Files** | Access files created by completed export jobs |
| **Downloads** | Access downloadable content |

### Export Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────────────┐
│ createExportJob │────▶│   Poll with     │────▶│      downloadFile           │
│ (camera, time)  │     │   getJob()      │     │ (extract fileId from URL)   │
└─────────────────┘     └─────────────────┘     └─────────────────────────────┘
                              │
                              ▼
                        Job States:
                        pending → started → success/failure

When job.state === 'success':
  File URL at: job.result?.intervals?.[0]?.files?.[0]?.url
  Extract fileId from URL (last path segment)
```

---

## Job Types

```typescript
type JobState = 'pending' | 'started' | 'success' | 'failure' | 'revoked'

// Nested structures for Job response
interface JobResultFile {
  name: string
  path?: string
  size?: number
  startTimestamp?: string
  endTimestamp?: string
  url?: string                    // Download URL - extract fileId from last segment
  checksum?: string
}

interface JobResultInterval {
  startTimestamp?: string
  endTimestamp?: string
  state?: string
  files?: JobResultFile[]
  error?: string | null
}

interface JobResult {
  state?: string
  error?: string | null
  intervals?: JobResultInterval[]
}

interface JobOriginalRequest {
  type?: string
  name?: string                   // Job display name set at creation
  directory?: string
  startTimestamp?: string
  endTimestamp?: string
  notes?: string | null
  tags?: string[] | null
}

interface JobArguments {
  deviceId?: string
  originalRequest?: JobOriginalRequest
}

interface Job {
  id: string
  namespace?: string
  type: string                    // 'video' | 'timeLapse' | 'bundle'
  userId: string
  state: JobState
  detailedState?: string | null
  progress?: number               // 0-1 float (multiply by 100 for percentage)
  error?: string | null           // Set when job fails
  arguments?: JobArguments        // Contains originalRequest with name
  result?: JobResult              // Contains intervals with file URLs
  createTimestamp: string
  updateTimestamp?: string
  expireTimestamp?: string
  scheduleTimestamp?: string | null
}

// Access nested fields:
// - Job name: job.arguments?.originalRequest?.name
// - File URL: job.result?.intervals?.[0]?.files?.[0]?.url
// - Request timestamps: job.arguments?.originalRequest?.startTimestamp

interface ListJobsParams {
  pageSize?: number
  pageToken?: string
  state__in?: JobState[]          // Filter by state
  type__in?: string[]             // Filter by job type
  userId?: string                 // Filter by user
  createTimestamp__gte?: string   // Filter by creation time
  createTimestamp__lte?: string
  sort?: string[]                 // Sort fields
}

interface GetJobParams {
  include?: string[]
}
```

---

## Export Types

```typescript
type ExportType = 'bundle' | 'timeLapse' | 'video'

interface CreateExportParams {
  type: ExportType                // Required
  cameraId: string                // Required
  startTimestamp: string          // Required: ISO 8601 with +00:00 timezone
  endTimestamp: string            // Required: ISO 8601 with +00:00 timezone
  name?: string                   // Optional display name
  playbackMultiplier?: number     // Required for timeLapse/bundle (1-48)
  autoDelete?: boolean            // Auto-delete after 2 weeks (default: false)
  directory?: string              // Archive directory (default: '/')
  notes?: string                  // Optional notes
  tags?: string[]                 // Optional tags
}

interface ExportJobResponse {
  id: string
  type: ExportType
  name?: string
  state: JobState
  createTimestamp: string
}
```

---

## File Types

```typescript
type FileType = 'video' | 'image' | 'bundle' | 'timeLapse' | 'other'

interface EenFile {
  id: string
  name: string
  type?: FileType
  sizeBytes?: number
  contentType?: string
  createTimestamp: string
}

interface ListFilesParams {
  pageSize?: number
  pageToken?: string
  type__in?: FileType[]
  name__contains?: string
}

interface DownloadFileResult {
  blob: Blob                      // Binary file data
  filename: string                // Parsed from Content-Disposition
  contentType: string             // MIME type
  size: number                    // File size in bytes
}
```

---

## Download Types

```typescript
type DownloadStatus = 'available' | 'expired' | 'pending' | 'error'

interface Download {
  id: string
  name?: string
  status: DownloadStatus
  sizeBytes?: number
  contentType?: string
  downloadUrl?: string
  expiresAt?: string
  createTimestamp: string
}

interface ListDownloadsParams {
  pageSize?: number
  pageToken?: string
  status__in?: DownloadStatus[]
  name__contains?: string
}

interface DownloadDownloadResult {
  blob: Blob
  filename: string
  contentType: string
  size: number
}
```

---

## Export Functions

### createExportJob(params)

Create a video export from a camera:

```typescript
import { createExportJob, formatTimestamp, type ExportType } from 'een-api-toolkit'

async function createExport(cameraId: string, durationMinutes: number = 15) {
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - durationMinutes * 60 * 1000)

  const { data, error } = await createExportJob({
    name: `Export - ${new Date().toLocaleString()}`,
    type: 'video',
    cameraId,
    startTimestamp: formatTimestamp(startTime.toISOString()),
    endTimestamp: formatTimestamp(endTime.toISOString())
  })

  if (error) {
    console.error('Failed to create export:', error.message)
    return null
  }

  console.log('Export job created:', data.id)
  return data
}
```

---

## Job Functions

### listJobs(params?)

List jobs with optional state filtering:

```typescript
import { listJobs, type Job, type JobState } from 'een-api-toolkit'

const { data, error } = await listJobs({
  pageSize: 20,
  state__in: ['pending', 'started', 'success']
})

if (data) {
  data.results.forEach(job => {
    const progressPercent = Math.round((job.progress || 0) * 100)
    console.log(`${job.name}: ${job.state} (${progressPercent}%)`)
  })
}
```

### getJob(jobId, params?)

Get a single job with polling pattern:

```typescript
import { ref, onUnmounted } from 'vue'
import { getJob, type Job } from 'een-api-toolkit'

const job = ref<Job | null>(null)
let pollInterval: ReturnType<typeof setInterval> | null = null

async function fetchJob(jobId: string) {
  const { data, error } = await getJob(jobId)

  if (error) {
    stopPolling()
    return
  }

  job.value = data

  // Auto-manage polling based on job state
  if (['pending', 'started'].includes(data.state)) {
    startPolling(jobId)
  } else {
    stopPolling()
  }
}

function startPolling(jobId: string) {
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

---

## File Functions

### listFiles(params?)

List available files:

```typescript
import { listFiles, type EenFile } from 'een-api-toolkit'

const { data, error } = await listFiles({
  pageSize: 20
})

if (data) {
  data.results.forEach(file => {
    console.log(`${file.name} (${file.sizeBytes} bytes)`)
  })
}
```

### downloadFile(fileId)

Download a file by ID:

```typescript
import { downloadFile, type EenFile } from 'een-api-toolkit'

async function handleDownload(file: EenFile) {
  const { data, error } = await downloadFile(file.id)

  if (error) {
    console.error('Download failed:', error.message)
    return
  }

  // Create browser download
  const url = URL.createObjectURL(data.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = data.filename || file.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

---

## Download Functions

### listDownloads(params?)

List available downloads:

```typescript
import { listDownloads, type Download } from 'een-api-toolkit'

const { data, error } = await listDownloads({
  status__in: ['available'],
  pageSize: 20
})
```

### downloadDownload(downloadId)

Download from downloads endpoint:

```typescript
import { downloadDownload, type Download } from 'een-api-toolkit'

async function handleDownload(download: Download) {
  const { data, error } = await downloadDownload(download.id)

  if (error) {
    console.error('Download failed:', error.message)
    return
  }

  const url = URL.createObjectURL(data.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = data.filename || download.name || 'download'
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## Complete Export Workflow

```typescript
import { ref, onUnmounted } from 'vue'
import {
  createExportJob,
  getJob,
  downloadFile,
  formatTimestamp,
  type Job
} from 'een-api-toolkit'

const job = ref<Job | null>(null)
const error = ref<string | null>(null)
let pollInterval: ReturnType<typeof setInterval> | null = null

async function startExport(cameraId: string, durationMinutes: number) {
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - durationMinutes * 60 * 1000)

  const result = await createExportJob({
    type: 'video',
    cameraId,
    startTimestamp: formatTimestamp(startTime.toISOString()),
    endTimestamp: formatTimestamp(endTime.toISOString())
  })

  if (result.error) {
    error.value = result.error.message
    return
  }

  job.value = result.data
  pollInterval = setInterval(() => pollJob(result.data.id), 3000)
}

async function pollJob(jobId: string) {
  const result = await getJob(jobId)
  if (result.error) {
    error.value = result.error.message
    stopPolling()
    return
  }

  job.value = result.data

  if (!['pending', 'started'].includes(result.data.state)) {
    stopPolling()
  }
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

async function downloadExport() {
  // Extract file URL from job result
  const fileUrl = job.value?.result?.intervals?.[0]?.files?.[0]?.url
  if (!fileUrl) return

  // Extract fileId from URL (last path segment)
  const fileId = fileUrl.substring(fileUrl.lastIndexOf('/') + 1)
  if (!fileId) return

  const result = await downloadFile(fileId)
  if (result.error) {
    error.value = result.error.message
    return
  }

  const url = URL.createObjectURL(result.data.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = result.data.filename || `export-${job.value?.id}.mp4`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onUnmounted(() => stopPolling())
```

---

## Vue Component Examples

### Jobs.vue

```typescript
import { ref, computed, onMounted } from 'vue'
import { listJobs, getCurrentUser, deleteJob, type Job, type EenError, type ListJobsParams, type JobState } from 'een-api-toolkit'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive state
const jobs = ref<Job[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)
const currentUserId = ref<string | null>(null)
const deletingId = ref<string | null>(null)

const hasNextPage = computed(() => !!nextPageToken.value)

// Filter state
const selectedStates = ref<JobState[]>([])
const stateOptions: { value: JobState; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'started', label: 'Started' },
  { value: 'success', label: 'Success' },
  { value: 'failure', label: 'Failure' },
  { value: 'revoked', label: 'Revoked' }
]

const params = ref<ListJobsParams>({ pageSize: 20 })

async function fetchJobs(fetchParams?: ListJobsParams, append = false) {
  loading.value = true
  error.value = null

  // Get current user ID if not already fetched
  if (!currentUserId.value) {
    const userResult = await getCurrentUser()
    if (userResult.error) {
      error.value = userResult.error
      loading.value = false
      return { error: userResult.error, data: null }
    }
    currentUserId.value = userResult.data.id
  }

  const mergedParams: ListJobsParams = { ...params.value, ...fetchParams, userId: currentUserId.value }

  // Add state filter if selected
  if (selectedStates.value.length > 0) {
    mergedParams.state__in = selectedStates.value
  }

  const result = await listJobs(mergedParams)

  if (result.error) {
    error.value = result.error
    if (!append) {
      jobs.value = []
    }
    nextPageToken.value = undefined
  } else {
    if (append) {
      jobs.value = [...jobs.value, ...result.data.results]
    } else {
      jobs.value = result.data.results
    }
    nextPageToken.value = result.data.nextPageToken
  }

  loading.value = false
  return result
}

function refresh() {
  return fetchJobs()
}

async function fetchNextPage() {
  if (!nextPageToken.value) return
  return fetchJobs({ ...params.value, pageToken: nextPageToken.value }, true)
}

function viewJob(jobId: string) {
  router.push(`/jobs/${jobId}`)
}

async function handleDelete(job: Job) {
  const jobName = getJobName(job)
  if (!confirm(`Are you sure you want to delete job "${jobName}"?`)) {
    return
  }

  deletingId.value = job.id
  const result = await deleteJob(job.id)

  if (result.error) {
    error.value = result.error
  } else {
    // Remove the job from the list
    jobs.value = jobs.value.filter(j => j.id !== job.id)
  }

  deletingId.value = null
}

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleString()
}

function getStateBadgeClass(state: JobState) {
  return `badge badge-${state}`
}

function getJobName(job: Job) {
  return job.arguments?.originalRequest?.name || job.id
}

onMounted(() => {
  fetchJobs()
})
```

### JobDetail.vue

```typescript
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getJob, downloadFile, type Job, type EenError } from 'een-api-toolkit'

const route = useRoute()
const router = useRouter()

const job = ref<Job | null>(null)
const loading = ref(false)
const error = ref<EenError | null>(null)
const downloading = ref(false)
const videoUrl = ref<string | null>(null)
const loadingVideo = ref(false)

// Polling state
const isPolling = ref(false)
let pollInterval: ReturnType<typeof setInterval> | null = null

const jobId = computed(() => route.params.id as string)

// Extract name from nested structure
const jobName = computed(() => {
  return job.value?.arguments?.originalRequest?.name || '-'
})

// Extract file URL from result (for download)
const fileUrl = computed(() => {
  return job.value?.result?.intervals?.[0]?.files?.[0]?.url
})

// Extract request timestamps from arguments
const requestStartTimestamp = computed(() => {
  return job.value?.arguments?.originalRequest?.startTimestamp
})

const requestEndTimestamp = computed(() => {
  return job.value?.arguments?.originalRequest?.endTimestamp
})

const canDownload = computed(() => {
  return job.value?.state === 'success' && fileUrl.value
})

const canPlay = computed(() => {
  // Can play video exports
  return canDownload.value && (job.value?.type === 'video' || job.value?.type === 'export')
})

async function fetchJob() {
  loading.value = true
  error.value = null

  const result = await getJob(jobId.value)

  if (result.error) {
    error.value = result.error
    job.value = null
    stopPolling()
  } else {
    job.value = result.data

    // Auto-start polling if job is pending or started
    if (['pending', 'started'].includes(result.data.state) && !isPolling.value) {
      startPolling()
    }

    // Stop polling if job is complete
    if (['success', 'failure', 'revoked'].includes(result.data.state)) {
      stopPolling()
    }
  }

  loading.value = false
}

function startPolling() {
  if (isPolling.value) return
  isPolling.value = true
  pollInterval = setInterval(fetchJob, 3000) // Poll every 3 seconds
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
  isPolling.value = false
}

async function handleDownload() {
  const url = fileUrl.value
  if (!url) return

  // Extract file ID from URL (last path segment)
  const urlParts = url.split('/')
  const fileId = urlParts[urlParts.length - 1]

  downloading.value = true
  const result = await downloadFile(fileId)

  if (result.error) {
    error.value = result.error
  } else {
    // Create download link
    const blobUrl = URL.createObjectURL(result.data.blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = result.data.filename
    a.click()
    URL.revokeObjectURL(blobUrl)
  }

  downloading.value = false
}

async function handlePlay() {
  const url = fileUrl.value
  if (!url) return

  // Extract file ID from URL (last path segment)
  const urlParts = url.split('/')
  const fileId = urlParts[urlParts.length - 1]

  loadingVideo.value = true
  error.value = null

  const result = await downloadFile(fileId)

  if (result.error) {
    error.value = result.error
  } else {
    // Revoke previous URL if exists
    if (videoUrl.value) {
      URL.revokeObjectURL(videoUrl.value)
    }
    // Create blob URL for video playback
    videoUrl.value = URL.createObjectURL(result.data.blob)
  }

  loadingVideo.value = false
}

function closePlayer() {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
    videoUrl.value = null
  }
}

function goBack() {
  router.push('/jobs')
}

function formatDate(timestamp: string | undefined) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString()
}

function getStateBadgeClass(state: string) {
  return `badge badge-${state}`
}

onMounted(() => {
  fetchJob()
})

onUnmounted(() => {
  stopPolling()
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
})
```

### CreateExport.vue

```typescript
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCameras, createExportJob, formatTimestamp, type Camera, type EenError, type ExportType } from 'een-api-toolkit'

const router = useRouter()

// Form state
const selectedCamera = ref<string>('')
const exportType = ref<ExportType>('video')
const exportName = ref('')
const duration = ref(15) // minutes
const playbackMultiplier = ref(10) // default multiplier for timeLapse/bundle

// Check if playbackMultiplier is needed
const needsPlaybackMultiplier = computed(() => {
  return exportType.value === 'timeLapse' || exportType.value === 'bundle'
})

// Data state
const cameras = ref<Camera[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref<EenError | null>(null)
const success = ref<string | null>(null)

const exportTypes: { value: ExportType; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'timeLapse', label: 'Time Lapse' },
  { value: 'bundle', label: 'Bundle (Video + Images)' }
]

const durationOptions = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' }
]

const playbackMultiplierOptions = [
  { value: 2, label: '2x (30 min → 15 min)' },
  { value: 5, label: '5x (30 min → 6 min)' },
  { value: 10, label: '10x (30 min → 3 min)' },
  { value: 20, label: '20x (30 min → 1.5 min)' },
  { value: 48, label: '48x (30 min → 37 sec)' }
]

const canSubmit = computed(() => {
  if (!selectedCamera.value || !exportType.value || submitting.value) {
    return false
  }
  // Validate playbackMultiplier for timeLapse/bundle
  if (needsPlaybackMultiplier.value) {
    return playbackMultiplier.value >= 1 && playbackMultiplier.value <= 48
  }
  return true
})

async function fetchCameras() {
  loading.value = true
  error.value = null

  const result = await getCameras({
    pageSize: 100,
    status__in: ['online', 'streaming']
  })

  if (result.error) {
    error.value = result.error
  } else {
    cameras.value = result.data.results
  }

  loading.value = false
}

async function handleSubmit() {
  if (!canSubmit.value) return

  submitting.value = true
  error.value = null
  success.value = null

  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - duration.value * 60 * 1000)

  const exportParams: Parameters<typeof createExportJob>[0] = {
    name: exportName.value || `Export - ${new Date().toLocaleString()}`,
    type: exportType.value,
    cameraId: selectedCamera.value,
    startTimestamp: formatTimestamp(startTime.toISOString()),
    endTimestamp: formatTimestamp(endTime.toISOString())
  }

  // Add playbackMultiplier for timeLapse and bundle exports
  if (needsPlaybackMultiplier.value) {
    exportParams.playbackMultiplier = playbackMultiplier.value
  }

  const result = await createExportJob(exportParams)

  if (result.error) {
    error.value = result.error
  } else {
    success.value = `Export job created successfully! Job ID: ${result.data.id}`
    // Redirect to job detail page after a moment
    setTimeout(() => {
      router.push(`/jobs/${result.data.id}`)
    }, 2000)
  }

  submitting.value = false
}

onMounted(() => {
  fetchCameras()
})
```

### Files.vue

```typescript
import { ref, computed, onMounted } from 'vue'
import { listFiles, downloadFile, deleteFile, type EenFile, type EenError, type ListFilesParams, type FileIncludeField } from 'een-api-toolkit'

// Reactive state
const files = ref<EenFile[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)
const downloadingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const selectedFile = ref<EenFile | null>(null)

const hasNextPage = computed(() => !!nextPageToken.value)

// Request size and createTimestamp by default for better display
const defaultInclude: FileIncludeField[] = ['size', 'createTimestamp']

const params = ref<ListFilesParams>({
  pageSize: 20,
  include: defaultInclude,
  sort: ['-createTimestamp']
})

async function fetchFiles(fetchParams?: ListFilesParams, append = false) {
  loading.value = true
  error.value = null

  const mergedParams = { ...params.value, ...fetchParams }
  const result = await listFiles(mergedParams)

  if (result.error) {
    error.value = result.error
    if (!append) {
      files.value = []
    }
    nextPageToken.value = undefined
  } else {
    if (append) {
      files.value = [...files.value, ...result.data.results]
    } else {
      files.value = result.data.results
    }
    nextPageToken.value = result.data.nextPageToken
  }

  loading.value = false
  return result
}

function refresh() {
  return fetchFiles()
}

async function fetchNextPage() {
  if (!nextPageToken.value) return
  return fetchFiles({ ...params.value, pageToken: nextPageToken.value }, true)
}

async function handleDownload(file: EenFile) {
  downloadingId.value = file.id
  const result = await downloadFile(file.id)

  if (result.error) {
    error.value = result.error
  } else {
    // Create download link
    const url = URL.createObjectURL(result.data.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.data.filename || file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  downloadingId.value = null
}

async function handleDelete(file: EenFile) {
  if (!confirm(`Are you sure you want to delete "${file.name}"? This will move it to the recycle bin.`)) {
    return
  }

  deletingId.value = file.id
  const result = await deleteFile(file.id)

  if (result.error) {
    error.value = result.error
  } else {
    // Remove the file from the list
    files.value = files.value.filter(f => f.id !== file.id)
  }

  deletingId.value = null
}

function formatDate(timestamp: string | undefined) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString()
}

function getFileType(file: EenFile) {
  // Use type if available, otherwise derive from mimeType
  if (file.type) return file.type
  if (file.mimeType) {
    if (file.mimeType.startsWith('video/')) return 'video'
    if (file.mimeType.startsWith('image/')) return 'image'
    if (file.mimeType === 'application/directory') return 'folder'
    return file.mimeType.split('/')[1] || file.mimeType
  }
  return '-'
}

function formatSize(bytes: number | undefined) {
  if (bytes === undefined || bytes === null) return '-'
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function openFileDetails(file: EenFile) {
  selectedFile.value = file
}

function closeModal() {
  selectedFile.value = null
}

onMounted(() => {
  fetchFiles()
})
```

---

## Error Handling

| Error Code | HTTP Status | Meaning | Action |
|------------|-------------|---------|--------|
| AUTH_REQUIRED | 401 | Not authenticated | Redirect to login |
| CAMERA_NOT_FOUND | 404 | Invalid camera ID | Verify camera exists |
| INVALID_TIMESTAMP | 400 | Bad timestamp format | Use formatTimestamp() |
| JOB_NOT_FOUND | 404 | Job ID doesn't exist | Check job ID |
| FILE_NOT_FOUND | 404 | File ID doesn't exist | Job may not be complete |
| DOWNLOAD_EXPIRED | 410 | Download link expired | Request new download |
| EXPORT_FAILED | 500 | Export processing failed | Check job.error |

---

## Best Practices

1. **Always use formatTimestamp()** for timestamp parameters
2. **Poll at reasonable intervals** (3-5 seconds recommended)
3. **Clean up polling** on component unmount
4. **Check job.state === 'success'** before attempting download
5. **Extract fileId from job.result URL** when calling downloadFile()
6. **Handle large downloads** appropriately (show progress)

---

## Reference Examples

- `examples/vue-jobs/` - Complete jobs, exports, files example
