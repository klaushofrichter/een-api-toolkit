// Configuration
export { initEenToolkit, getConfig, getProxyUrl, getClientId, getRedirectUri, getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS } from './config'

// Types
export type {
  Result,
  EenError,
  ErrorCode,
  PaginationParams,
  PaginatedResult,
  EenToolkitConfig,
  StorageStrategy,
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
  MediaSessionResponse,
  MediaSessionResult,
  Feed,
  FeedStreamType,
  FeedMediaType,
  FeedIncludeOption,
  ListFeedsParams,
  ListFeedsResult,
  Event,
  EventData,
  EventType,
  EventFieldValues,
  ActorType,
  ListEventsParams,
  GetEventParams,
  ListEventTypesParams,
  ListEventFieldValuesParams,
  // Event Metrics types
  EventMetric,
  MetricActorType,
  MetricDataPoint,
  GetEventMetricsParams,
  // Alert types
  Alert,
  AlertAction,
  AlertType,
  AlertInclude,
  AlertSort,
  AlertActionStatus,
  ListAlertsParams,
  GetAlertParams,
  ListAlertTypesParams,
  // Notification types
  Notification,
  NotificationCategory,
  NotificationStatus,
  ListNotificationsParams
} from './types'

// Type helpers
export { success, failure } from './types'

// Utilities
export { formatTimestamp } from './utils'

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
  getRecordedImage,
  getMediaSession,
  initMediaSession
} from './media'

// Feeds - Plain functions
export {
  listFeeds
} from './feeds'

// Events - Plain functions
export {
  listEvents,
  getEvent,
  listEventTypes,
  listEventFieldValues
} from './events'

// Event Metrics - Plain functions
export {
  getEventMetrics
} from './eventMetrics'

// Alerts - Plain functions
export {
  listAlerts,
  getAlert,
  listAlertTypes
} from './alerts'

// Notifications - Plain functions
export {
  listNotifications,
  getNotification
} from './notifications'
