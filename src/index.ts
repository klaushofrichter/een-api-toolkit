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
  GetCameraParams,
  Bridge,
  BridgeStatus,
  BridgeDeviceInfo,
  BridgeNetworkInfo,
  BridgeDevicePosition,
  ListBridgesParams,
  GetBridgeParams,
  MediaType,
  MediaStreamType,
  MediaInterval,
  ListMediaParams,
  GetLiveImageParams,
  GetRecordedImageParams,
  LiveImageResult,
  RecordedImageResult,
  Feed,
  FeedStreamType,
  FeedMediaType,
  FeedIncludeOption,
  ListFeedsParams,
  ListFeedsResult
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

// Cameras - Plain functions
export {
  getCameras,
  getCamera
} from './cameras'

// Bridges - Plain functions
export {
  getBridges,
  getBridge
} from './bridges'

// Media - Plain functions
export {
  listMedia,
  getLiveImage,
  getRecordedImage
} from './media'

// Feeds - Plain functions
export {
  listFeeds
} from './feeds'
