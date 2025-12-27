// Configuration
export { initEenToolkit, getConfig, getProxyUrl, getClientId, getRedirectUri } from './config'

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

// Auth types
export type { TokenResponse } from './auth'

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

// Users - Composable option types
export type {
  UseCurrentUserOptions,
  UseUsersOptions,
  UseUserOptions
} from './users'
