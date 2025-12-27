// Configuration
export { initEenToolkit, getConfig, getProxyUrl, getClientId } from './config'

// Types
export type {
  Result,
  EenError,
  ErrorCode,
  PaginationParams,
  PaginatedResult,
  EenToolkitConfig,
  User,
  UserProfile,
  ListUsersParams,
  GetUserParams
} from './types'

// Type helpers
export { success, failure } from './types'

// Auth
export {
  useAuthStore,
  getAuthUrl,
  getAccessToken,
  refreshToken,
  revokeToken,
  handleAuthCallback
} from './auth'

// Users - Plain functions
export {
  getCurrentUser,
  getUsers,
  getUser
} from './users'

// Users - Composables
export {
  useCurrentUser,
  useUsers,
  useUser
} from './users'
