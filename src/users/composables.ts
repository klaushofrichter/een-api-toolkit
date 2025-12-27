import { ref, computed, onMounted } from 'vue'
import { getCurrentUser, getUsers, getUser } from './service'
import type { User, UserProfile, EenError, ListUsersParams, GetUserParams } from '../types'

/**
 * Composable for getting the current authenticated user
 */
export function useCurrentUser(options?: { immediate?: boolean }) {
  const user = ref<UserProfile | null>(null)
  const loading = ref(false)
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
 * Composable for listing users with pagination
 */
export function useUsers(initialParams?: ListUsersParams, options?: { immediate?: boolean }) {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<EenError | null>(null)
  const nextPageToken = ref<string | undefined>(undefined)
  const prevPageToken = ref<string | undefined>(undefined)
  const totalSize = ref<number | undefined>(undefined)

  const hasNextPage = computed(() => !!nextPageToken.value)
  const hasPrevPage = computed(() => !!prevPageToken.value)

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

  const refresh = () => fetch()

  const fetchNextPage = async () => {
    if (!nextPageToken.value) return
    return fetch({ ...params.value, pageToken: nextPageToken.value })
  }

  const fetchPrevPage = async () => {
    if (!prevPageToken.value) return
    return fetch({ ...params.value, pageToken: prevPageToken.value })
  }

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
 * Composable for getting a single user by ID
 */
export function useUser(userId: string | (() => string), options?: { immediate?: boolean; include?: string[] }) {
  const user = ref<User | null>(null)
  const loading = ref(false)
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
