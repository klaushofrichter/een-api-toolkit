import { ref, computed, onMounted } from 'vue'
import { getCurrentUser, getUsers, getUser } from './service'
import type { User, UserProfile, EenError, ListUsersParams, GetUserParams } from '../types'

/**
 * Options for the useCurrentUser composable.
 *
 * @category Users
 */
export interface UseCurrentUserOptions {
  /**
   * Whether to fetch the user immediately on mount.
   * @defaultValue true
   */
  immediate?: boolean
}

/**
 * Vue 3 composable for getting the current authenticated user.
 *
 * @remarks
 * Provides reactive access to the current user's profile with automatic
 * fetching on component mount (configurable via options).
 *
 * @param options - Configuration options
 * @returns Reactive user state and control functions
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCurrentUser } from 'een-api-toolkit'
 *
 * const { user, loading, error, refresh } = useCurrentUser()
 * </script>
 *
 * <template>
 *   <div v-if="loading">Loading...</div>
 *   <div v-else-if="error">Error: {{ error.message }}</div>
 *   <div v-else-if="user">
 *     <h1>Welcome, {{ user.firstName }}!</h1>
 *     <p>Email: {{ user.email }}</p>
 *     <button @click="refresh">Refresh</button>
 *   </div>
 * </template>
 * ```
 *
 * @example
 * ```typescript
 * // Manual fetch (don't fetch on mount)
 * const { user, fetch } = useCurrentUser({ immediate: false })
 *
 * onMounted(async () => {
 *   if (someCondition) {
 *     await fetch()
 *   }
 * })
 * ```
 *
 * @category Users
 */
export function useCurrentUser(options?: UseCurrentUserOptions) {
  /** The current user profile, or null if not loaded */
  const user = ref<UserProfile | null>(null)
  /** Whether a fetch is in progress */
  const loading = ref(false)
  /** The last error that occurred, or null if successful */
  const error = ref<EenError | null>(null)

  const fetch = async () => {
    loading.value = true
    error.value = null

    const result = await getCurrentUser()

    if (result.error) {
      error.value = result.error
      user.value = null
    } else {
      user.value = result.data
    }

    loading.value = false
    return result
  }

  /** Alias for fetch - refresh the current user data */
  const refresh = fetch

  // Fetch immediately by default
  if (options?.immediate !== false) {
    onMounted(fetch)
  }

  return {
    user,
    loading,
    error,
    fetch,
    refresh
  }
}

/**
 * Options for the useUsers composable.
 *
 * @category Users
 */
export interface UseUsersOptions {
  /**
   * Whether to fetch users immediately on mount.
   * @defaultValue true
   */
  immediate?: boolean
}

/**
 * Vue 3 composable for listing users with pagination.
 *
 * @remarks
 * Provides reactive access to a paginated list of users with built-in
 * pagination controls. Automatically fetches on mount unless disabled.
 *
 * @param initialParams - Initial pagination/filter parameters
 * @param options - Configuration options
 * @returns Reactive users state and pagination controls
 *
 * @example
 * ```vue
 * <script setup>
 * import { useUsers } from 'een-api-toolkit'
 *
 * const {
 *   users,
 *   loading,
 *   error,
 *   hasNextPage,
 *   fetchNextPage,
 *   refresh
 * } = useUsers({ pageSize: 20 })
 * </script>
 *
 * <template>
 *   <div v-if="loading">Loading...</div>
 *   <div v-else-if="error">Error: {{ error.message }}</div>
 *   <div v-else>
 *     <ul>
 *       <li v-for="user in users" :key="user.id">
 *         {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
 *       </li>
 *     </ul>
 *     <button v-if="hasNextPage" @click="fetchNextPage">
 *       Load More
 *     </button>
 *     <button @click="refresh">Refresh</button>
 *   </div>
 * </template>
 * ```
 *
 * @example
 * ```typescript
 * // Change parameters dynamically
 * const { users, setParams, fetch } = useUsers()
 *
 * async function searchUsers(query: string) {
 *   setParams({ pageSize: 50 })
 *   await fetch()
 * }
 * ```
 *
 * @category Users
 */
export function useUsers(initialParams?: ListUsersParams, options?: UseUsersOptions) {
  /** Array of users for the current page */
  const users = ref<User[]>([])
  /** Whether a fetch is in progress */
  const loading = ref(false)
  /** The last error that occurred, or null if successful */
  const error = ref<EenError | null>(null)
  /** Token for fetching the next page */
  const nextPageToken = ref<string | undefined>(undefined)
  /** Token for fetching the previous page */
  const prevPageToken = ref<string | undefined>(undefined)
  /** Total number of users (if provided by API) */
  const totalSize = ref<number | undefined>(undefined)

  /** Whether there is a next page available */
  const hasNextPage = computed(() => !!nextPageToken.value)
  /** Whether there is a previous page available */
  const hasPrevPage = computed(() => !!prevPageToken.value)

  /** Current pagination/filter parameters */
  const params = ref<ListUsersParams>(initialParams ?? {})

  const fetch = async (fetchParams?: ListUsersParams) => {
    loading.value = true
    error.value = null

    const mergedParams = { ...params.value, ...fetchParams }
    const result = await getUsers(mergedParams)

    if (result.error) {
      error.value = result.error
      users.value = []
      nextPageToken.value = undefined
      prevPageToken.value = undefined
      totalSize.value = undefined
    } else {
      users.value = result.data.results
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
  const setParams = (newParams: ListUsersParams) => {
    params.value = newParams
  }

  // Fetch immediately by default
  if (options?.immediate !== false) {
    onMounted(fetch)
  }

  return {
    users,
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
 * Options for the useUser composable.
 *
 * @category Users
 */
export interface UseUserOptions {
  /**
   * Whether to fetch the user immediately on mount.
   * @defaultValue true
   */
  immediate?: boolean
  /**
   * Additional fields to include in the response.
   */
  include?: string[]
}

/**
 * Vue 3 composable for getting a single user by ID.
 *
 * @remarks
 * Provides reactive access to a specific user. The user ID can be provided
 * as a string or a getter function (useful for reactive route params).
 *
 * @param userId - The user ID (string or getter function)
 * @param options - Configuration options
 * @returns Reactive user state and control functions
 *
 * @example
 * ```vue
 * <script setup>
 * import { useUser } from 'een-api-toolkit'
 * import { useRoute } from 'vue-router'
 *
 * const route = useRoute()
 *
 * // Static ID
 * const { user, loading, error } = useUser('user-123')
 *
 * // Or reactive ID from route
 * const { user: routeUser } = useUser(() => route.params.id as string)
 * </script>
 *
 * <template>
 *   <div v-if="loading">Loading...</div>
 *   <div v-else-if="error">Error: {{ error.message }}</div>
 *   <div v-else-if="user">
 *     <h1>{{ user.firstName }} {{ user.lastName }}</h1>
 *     <p>Email: {{ user.email }}</p>
 *   </div>
 * </template>
 * ```
 *
 * @example
 * ```typescript
 * // With additional fields
 * const { user } = useUser('user-123', {
 *   include: ['permissions']
 * })
 *
 * // Access permissions when loaded
 * watchEffect(() => {
 *   if (user.value?.permissions) {
 *     console.log('User permissions:', user.value.permissions)
 *   }
 * })
 * ```
 *
 * @category Users
 */
export function useUser(userId: string | (() => string), options?: UseUserOptions) {
  /** The user, or null if not loaded */
  const user = ref<User | null>(null)
  /** Whether a fetch is in progress */
  const loading = ref(false)
  /** The last error that occurred, or null if successful */
  const error = ref<EenError | null>(null)

  const resolveUserId = () => {
    return typeof userId === 'function' ? userId() : userId
  }

  const fetch = async (params?: GetUserParams) => {
    const id = resolveUserId()
    if (!id) {
      error.value = { code: 'VALIDATION_ERROR', message: 'User ID is required' }
      return { data: null, error: error.value }
    }

    loading.value = true
    error.value = null

    const mergedParams: GetUserParams = {
      include: options?.include,
      ...params
    }

    const result = await getUser(id, mergedParams)

    if (result.error) {
      error.value = result.error
      user.value = null
    } else {
      user.value = result.data
    }

    loading.value = false
    return result
  }

  /** Refresh the user data */
  const refresh = () => fetch()

  // Fetch immediately by default if userId is provided
  if (options?.immediate !== false && resolveUserId()) {
    onMounted(fetch)
  }

  return {
    user,
    loading,
    error,
    fetch,
    refresh
  }
}
