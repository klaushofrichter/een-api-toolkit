# Layouts API - EEN API Toolkit

> **Version:** 0.3.57
>
> Complete reference for layout management (camera grouping).
> Load this document when working with layouts.

---

## Overview

Layouts organize multiple camera views into a grid for monitoring. Each layout contains:
- **Name** - Display name for the layout
- **Settings** - Display configuration (columns, aspect ratio, borders)
- **Panes** - Array of camera positions in the grid

---

## Layout Types

### Layout

```typescript
interface Layout {
  id: string
  name: string
  accountId: string
  panes: LayoutPane[]
  settings: LayoutSettings
  effectivePermissions?: LayoutPermissions
  resourceCounts?: { cameras?: number }
  resourceStatusCounts?: { cameras?: CameraStatusCounts }
  qRelevance?: number
}

interface LayoutPane {
  id: number              // Unique pane ID within layout
  name: string            // Display name
  type: 'preview' | 'compositePreview'
  size: 1 | 2 | 3        // Grid size (1=small, 2=medium, 3=large)
  cameraId: string       // Camera to display
  compositeId?: string | null
}

interface LayoutSettings {
  showCameraBorder: boolean
  showCameraName: boolean
  cameraAspectRatio: '16x9' | '4x3'
  paneColumns: number    // 1-6 columns
}

interface LayoutPermissions {
  read?: boolean
  edit?: boolean
  delete?: boolean
}
```

### Parameters

```typescript
interface ListLayoutsParams {
  pageSize?: number              // Results per page
  pageToken?: string             // Pagination token
  include?: ListLayoutsInclude[] // Additional fields
  sort?: ListLayoutsSort[]       // Sort order
  name?: string                  // Exact name match
  name__in?: string[]            // Names (any match)
  name__contains?: string        // Partial name match
  id__in?: string[]              // Filter by IDs
  q?: string                     // Full-text search
  qRelevance__gte?: number       // Min relevance (0.0-1.0)
}

type ListLayoutsInclude =
  | 'effectivePermissions'
  | 'resourceCounts'
  | 'resourceStatusCounts'
  | 'qRelevance'

type ListLayoutsSort =
  | '+name' | '-name'
  | '+rotationOrder'
  | '+qRelevance' | '-qRelevance'

interface CreateLayoutParams {
  name: string           // Required
  settings: LayoutSettings  // Required
  panes?: LayoutPane[]   // Optional initial panes
}

interface UpdateLayoutParams {
  name?: string
  settings?: Partial<LayoutSettings>
  panes?: LayoutPane[]   // Replaces existing panes
}
```

---

## Layout Functions

### getLayouts(params?)

```typescript
import { getLayouts } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getLayouts()

// With pagination and includes
const { data } = await getLayouts({
  pageSize: 50,
  include: ['resourceCounts', 'effectivePermissions']
})

// Search layouts
const { data } = await getLayouts({
  q: 'lobby',
  qRelevance__gte: 0.5
})

// Filter by name
const { data } = await getLayouts({
  name__contains: 'entrance'
})
```

### getLayout(layoutId, params?)

```typescript
import { getLayout } from 'een-api-toolkit'

const { data, error } = await getLayout('layout-123')

// With additional fields
const { data: detailed } = await getLayout('layout-123', {
  include: ['effectivePermissions', 'resourceStatusCounts']
})

if (data) {
  console.log(`Layout: ${data.name}`)
  console.log(`Panes: ${data.panes.length}`)
  console.log(`Columns: ${data.settings.paneColumns}`)
}
```

### createLayout(params)

```typescript
import { createLayout, type LayoutSettings } from 'een-api-toolkit'

const settings: LayoutSettings = {
  showCameraBorder: true,
  showCameraName: true,
  cameraAspectRatio: '16x9',
  paneColumns: 3
}

// Create empty layout
const { data, error } = await createLayout({
  name: 'Main Lobby View',
  settings
})

// Create with panes
const { data } = await createLayout({
  name: 'Entrance Cameras',
  settings,
  panes: [
    { id: 1, name: 'Front Door', type: 'preview', size: 2, cameraId: 'cam-123' },
    { id: 2, name: 'Side Gate', type: 'preview', size: 1, cameraId: 'cam-456' }
  ]
})

if (data) {
  console.log(`Created layout: ${data.id}`)
}
```

### updateLayout(layoutId, params)

```typescript
import { updateLayout } from 'een-api-toolkit'

// Update name
const { error } = await updateLayout('layout-123', {
  name: 'Updated Layout Name'
})

// Update settings (partial)
const { error } = await updateLayout('layout-123', {
  settings: {
    paneColumns: 4,
    showCameraName: false
  }
})

// Replace panes
const { error } = await updateLayout('layout-123', {
  panes: [
    { id: 1, name: 'New Pane', type: 'preview', size: 1, cameraId: 'cam-789' }
  ]
})

if (!error) {
  console.log('Layout updated successfully')
}
```

### deleteLayout(layoutId)

```typescript
import { deleteLayout } from 'een-api-toolkit'

const { error } = await deleteLayout('layout-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Layout already deleted')
  } else if (error.code === 'FORBIDDEN') {
    console.log('No permission to delete')
  }
} else {
  console.log('Layout deleted successfully')
}
```

---

## Filter Patterns

| Filter | Example | Description |
|--------|---------|-------------|
| `name` | `'Main Lobby'` | Exact name match |
| `name__in` | `['Lobby', 'Entrance']` | Any name matches |
| `name__contains` | `'lobby'` | Partial name match |
| `id__in` | `['id1', 'id2']` | Filter by IDs |
| `q` | `'front door'` | Full-text search |
| `qRelevance__gte` | `0.5` | Min search relevance |

---

## Vue Component Example

```typescript
import { ref, computed, onMounted } from 'vue'
import {
  getLayouts,
  getCameras,
  createLayout,
  updateLayout,
  deleteLayout,
  type Layout,
  type Camera,
  type EenError,
  type ListLayoutsParams,
  type CreateLayoutParams,
  type UpdateLayoutParams,
  type LayoutSettings
} from 'een-api-toolkit'
import LayoutModal from '../components/LayoutModal.vue'

// Reactive state
const layouts = ref<Layout[]>([])
const cameras = ref<Camera[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)

const hasNextPage = computed(() => !!nextPageToken.value)

const params = ref<ListLayoutsParams>({
  pageSize: 20,
  include: ['resourceCounts', 'effectivePermissions']
})

// Modal state
const showModal = ref(false)
const selectedLayout = ref<Layout | null>(null)
const modalLoading = ref(false)
const modalError = ref<string | null>(null)

// Default settings for new layouts
const defaultSettings: LayoutSettings = {
  showCameraBorder: true,
  showCameraName: true,
  cameraAspectRatio: '16x9',
  paneColumns: 3
}

async function fetchLayouts(fetchParams?: ListLayoutsParams, append = false) {
  loading.value = true
  error.value = null

  const mergedParams = { ...params.value, ...fetchParams }
  const result = await getLayouts(mergedParams)

  if (result.error) {
    error.value = result.error
    if (!append) {
      layouts.value = []
    }
    nextPageToken.value = undefined
  } else {
    if (append) {
      layouts.value = [...layouts.value, ...result.data.results]
    } else {
      layouts.value = result.data.results
    }
    nextPageToken.value = result.data.nextPageToken
  }

  loading.value = false
  return result
}

async function fetchCameras() {
  const result = await getCameras({ pageSize: 100, include: ['status'] })
  if (result.data) {
    cameras.value = result.data.results
  }
}

function refresh() {
  return fetchLayouts()
}

async function fetchNextPage() {
  if (!nextPageToken.value) return
  // Destructure to explicitly exclude any existing pageToken from params
  const { pageToken: _existingToken, ...restParams } = params.value
  return fetchLayouts({ ...restParams, pageToken: nextPageToken.value }, true)
}

function openCreateModal() {
  selectedLayout.value = null
  modalError.value = null
  showModal.value = true
}

function openEditModal(layout: Layout) {
  selectedLayout.value = layout
  modalError.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedLayout.value = null
  modalError.value = null
}

async function handleSave(data: { name: string; settings: LayoutSettings; panes: Layout['panes'] }) {
  modalLoading.value = true
  modalError.value = null

  try {
    if (selectedLayout.value) {
      // Update existing layout
      const updateParams: UpdateLayoutParams = {
        name: data.name,
        settings: data.settings,
        panes: data.panes
      }

      const result = await updateLayout(selectedLayout.value.id, updateParams)
      if (result.error) {
        modalError.value = result.error.message
        return
      }
    } else {
      // Create new layout
      const createParams: CreateLayoutParams = {
        name: data.name,
        settings: data.settings,
        panes: data.panes
      }

      const result = await createLayout(createParams)
      if (result.error) {
        modalError.value = result.error.message
        return
      }
    }

    closeModal()
    await fetchLayouts()
  } catch (err) {
    // Handle unexpected errors (network failures, state mutations, etc.)
    modalError.value = err instanceof Error ? err.message : 'An unexpected error occurred'
    console.error('handleSave error:', err)
  } finally {
    modalLoading.value = false
  }
}

async function handleDelete(layoutId: string) {
  if (!confirm('Are you sure you want to delete this layout?')) {
    return
  }

  modalLoading.value = true
  modalError.value = null

  const result = await deleteLayout(layoutId)

  if (result.error) {
    modalError.value = result.error.message
    modalLoading.value = false
    return
  }

  closeModal()
  await fetchLayouts()
  modalLoading.value = false
}

onMounted(async () => {
  await Promise.all([fetchLayouts(), fetchCameras()])
})
```

---

## Error Handling

| Error Code | HTTP Status | Meaning | Action |
|------------|-------------|---------|--------|
| AUTH_REQUIRED | 401 | Not authenticated | Redirect to login |
| FORBIDDEN | 403 | No permission | Show access denied |
| NOT_FOUND | 404 | Layout doesn't exist | Show "not found" |
| VALIDATION_ERROR | 400 | Invalid request | Show validation error |
| RATE_LIMITED | 429 | Too many requests | Retry with backoff |
| API_ERROR | 5xx | Server error | Show error, allow retry |

---

## Best Practices

1. **Check permissions before edit/delete**
   ```typescript
   if (layout.effectivePermissions?.edit) {
     // Show edit button
   }
   ```

2. **Use includes sparingly** - Only request fields you need
   ```typescript
   // Only include what you'll display
   const { data } = await getLayouts({
     include: ['resourceCounts']  // Skip permissions if not needed
   })
   ```

3. **Handle empty panes array**
   ```typescript
   // Layout can have empty panes array
   const paneCount = layout.panes?.length || 0
   ```

4. **Validate panes before save**
   ```typescript
   // Remove panes without cameras
   const validPanes = panes.filter(p => p.cameraId)
   await updateLayout(layoutId, { panes: validPanes })
   ```

---

## Reference Examples

- `examples/vue-layouts/` - Complete CRUD example with modal
