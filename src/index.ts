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
  GetUserParams,
  Camera,
  CameraStatus,
  CameraDeviceInfo,
  CameraShareDetails,
  CameraStreamUrls,
  CameraRtspConnectionSettings,
  CameraDevicePosition,
  CameraRecordingModes,
  ListCamerasParams,
  GetCameraParams
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

// Cameras - Plain functions
export {
  getCameras,
  getCamera
} from './cameras'

// Cameras - Composables
export {
  useCameras,
  useCamera
} from './cameras'

// Cameras - Composable option types
export type {
  UseCamerasOptions,
  UseCameraOptions
} from './cameras'
