import { ref, computed, onMounted, watch } from 'vue'
import { getCameras, getCamera } from './service'
import type { Camera, EenError, ListCamerasParams, GetCameraParams } from '../types'

/**
 * Options for the useCameras composable.
 *
 * @category Cameras
 */
export interface UseCamerasOptions {
  /**
   * Whether to fetch cameras immediately on mount.
   * @defaultValue true
   */
  immediate?: boolean
}

/**
 * Vue 3 composable for listing cameras with pagination.
 *
 * @remarks
 * Provides reactive access to a paginated list of cameras with built-in
 * pagination controls. Automatically fetches on mount unless disabled.
 *
 * @param initialParams - Initial pagination/filter parameters
 * @param options - Configuration options
 * @returns Reactive cameras state and pagination controls
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCameras } from 'een-api-toolkit'
 *
 * const {
 *   cameras,
 *   loading,
 *   error,
 *   hasNextPage,
 *   fetchNextPage,
 *   refresh
 * } = useCameras({ pageSize: 20, status__in: ['online'] })
 * </script>
 *
 * <template>
 *   <div v-if="loading">Loading...</div>
 *   <div v-else-if="error">Error: {{ error.message }}</div>
 *   <div v-else>
 *     <ul>
 *       <li v-for="camera in cameras" :key="camera.id">
 *         {{ camera.name }} ({{ camera.status }})
 *       </li>
 *     </ul>
 *     <button v-if="hasNextPage" @click="fetchNextPage">Load More</button>
 *     <button @click="refresh">Refresh</button>
 *   </div>
 * </template>
 * ```
 *
 * @example
 * ```typescript
 * // Change parameters dynamically
 * const { cameras, setParams, fetch } = useCameras()
 *
 * async function filterByStatus(status: string) {
 *   setParams({ pageSize: 50, status__in: [status] })
 *   await fetch()
 * }
 * ```
 *
 * @category Cameras
 */
export function useCameras(initialParams?: ListCamerasParams, options?: UseCamerasOptions) {
  /** Array of cameras for the current page */
  const cameras = ref<Camera[]>([])
  /** Whether a fetch is in progress */
  const loading = ref(false)
  /** The last error that occurred, or null if successful */
  const error = ref<EenError | null>(null)
  /** Token for fetching the next page */
  const nextPageToken = ref<string | undefined>(undefined)
  /** Token for fetching the previous page */
  const prevPageToken = ref<string | undefined>(undefined)
  /** Total number of cameras (if provided by API) */
  const totalSize = ref<number | undefined>(undefined)

  /** Whether there is a next page available */
  const hasNextPage = computed(() => !!nextPageToken.value)
  /** Whether there is a previous page available */
  const hasPrevPage = computed(() => !!prevPageToken.value)

  /** Current pagination/filter parameters */
  const params = ref<ListCamerasParams>(initialParams ?? {})

  const fetch = async (fetchParams?: ListCamerasParams) => {
    loading.value = true
    error.value = null

    const mergedParams = { ...params.value, ...fetchParams }
    const result = await getCameras(mergedParams)

    if (result.error) {
      error.value = result.error
      cameras.value = []
      nextPageToken.value = undefined
      prevPageToken.value = undefined
      totalSize.value = undefined
    } else {
      cameras.value = result.data.results
      nextPageToken.value = result.data.nextPageToken
      prevPageToken.value = result.data.prevPageToken
      totalSize.value = result.data.totalSize
    }

    loading.value = false
    return result
  }

  /** Refresh the current page */
  const refresh = () => fetch()

  /** Fetch the next page of results */
  const fetchNextPage = async () => {
    if (!nextPageToken.value) return
    return fetch({ ...params.value, pageToken: nextPageToken.value })
  }

  /** Fetch the previous page of results */
  const fetchPrevPage = async () => {
    if (!prevPageToken.value) return
    return fetch({ ...params.value, pageToken: prevPageToken.value })
  }

  /** Update the pagination/filter parameters */
  const setParams = (newParams: ListCamerasParams) => {
    params.value = newParams
  }

  // Fetch immediately by default
  if (options?.immediate !== false) {
    onMounted(fetch)
  }

  return {
    cameras,
    loading,
    error,
    nextPageToken,
    prevPageToken,
    totalSize,
    hasNextPage,
    hasPrevPage,
    params,
    fetch,
    refresh,
    fetchNextPage,
    fetchPrevPage,
    setParams
  }
}

/**
 * Options for the useCamera composable.
 *
 * @category Cameras
 */
export interface UseCameraOptions {
  /**
   * Whether to fetch the camera immediately on mount.
   * @defaultValue true
   */
  immediate?: boolean
  /**
   * Additional fields to include in the response.
   */
  include?: string[]
}

/**
 * Vue 3 composable for getting a single camera by ID.
 *
 * @remarks
 * Provides reactive access to a specific camera. The camera ID can be provided
 * as a string or a getter function (useful for reactive route params).
 *
 * @param cameraId - The camera ID (string or getter function)
 * @param options - Configuration options
 * @returns Reactive camera state and control functions
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCamera } from 'een-api-toolkit'
 * import { useRoute } from 'vue-router'
 *
 * const route = useRoute()
 *
 * // Static ID
 * const { camera, loading, error } = useCamera('camera-123')
 *
 * // Or reactive ID from route
 * const { camera: routeCamera } = useCamera(() => route.params.id as string)
 * </script>
 *
 * <template>
 *   <div v-if="loading">Loading...</div>
 *   <div v-else-if="error">Error: {{ error.message }}</div>
 *   <div v-else-if="camera">
 *     <h1>{{ camera.name }}</h1>
 *     <p>Status: {{ camera.status }}</p>
 *   </div>
 * </template>
 * ```
 *
 * @example
 * ```typescript
 * // With additional fields
 * const { camera } = useCamera('camera-123', {
 *   include: ['deviceInfo', 'status', 'shareDetails']
 * })
 *
 * // Access device info when loaded
 * watchEffect(() => {
 *   if (camera.value?.deviceInfo) {
 *     console.log('Camera make:', camera.value.deviceInfo.make)
 *   }
 * })
 * ```
 *
 * @category Cameras
 */
export function useCamera(cameraId: string | (() => string), options?: UseCameraOptions) {
  /** The camera, or null if not loaded */
  const camera = ref<Camera | null>(null)
  /** Whether a fetch is in progress */
  const loading = ref(false)
  /** The last error that occurred, or null if successful */
  const error = ref<EenError | null>(null)

  const resolveCameraId = () => {
    return typeof cameraId === 'function' ? cameraId() : cameraId
  }

  const fetch = async (params?: GetCameraParams) => {
    const id = resolveCameraId()
    if (!id) {
      error.value = { code: 'VALIDATION_ERROR', message: 'Camera ID is required' }
      return { data: null, error: error.value }
    }

    loading.value = true
    error.value = null

    const mergedParams: GetCameraParams = {
      include: options?.include,
      ...params
    }

    const result = await getCamera(id, mergedParams)

    if (result.error) {
      error.value = result.error
      camera.value = null
    } else {
      camera.value = result.data
    }

    loading.value = false
    return result
  }

  /** Refresh the camera data */
  const refresh = () => fetch()

  // Fetch immediately by default if cameraId is provided
  if (options?.immediate !== false && resolveCameraId()) {
    onMounted(fetch)
  }

  // Watch for camera ID changes when using a getter function
  if (typeof cameraId === 'function') {
    watch(cameraId, (newId, oldId) => {
      if (newId && newId !== oldId) {
        fetch()
      }
    })
  }

  return {
    camera,
    loading,
    error,
    fetch,
    refresh
  }
}
