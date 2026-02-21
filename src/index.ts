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
  CameraSettings,
  CameraSettingsData,
  CameraSettingsInclude,
  GetCameraSettingsParams,
  CameraSettingsRetention,
  CameraSettingsAudio,
  CameraSettingsPreviewVideo,
  CameraSettingsMainVideo,
  CameraSettingsAnalog,
  CameraSettingsOperating,
  CameraSettingsTalkdown,
  CameraSettingsCredentials,
  CameraSettingsScheduledOverride,
  Bridge,
  BridgeStatus,
  BridgeDeviceInfo,
  BridgeNetworkInfo,
  BridgeDevicePosition,
  ListBridgesParams,
  GetBridgeParams,
  // Layout types
  Layout,
  LayoutPane,
  LayoutPaneType,
  LayoutPaneSize,
  LayoutSettings,
  LayoutPermissions,
  CameraAspectRatio,
  CameraStatusCounts,
  ListLayoutsParams,
  ListLayoutsInclude,
  ListLayoutsSort,
  GetLayoutParams,
  GetLayoutInclude,
  CreateLayoutParams,
  UpdateLayoutParams,
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
  ListNotificationsParams,
  // EventSubscription types
  EventSubscription,
  EventSubscriptionConfig,
  EventSubscriptionLifecycle,
  EventSubscriptionDeliveryType,
  EventSubscriptionFilter,
  SSEDeliveryConfig,
  WebhookDeliveryConfig,
  DeliveryConfig,
  SSEDeliveryConfigCreate,
  WebhookDeliveryConfigCreate,
  DeliveryConfigCreate,
  EventTypeFilter,
  FilterCreate,
  CreateEventSubscriptionParams,
  ListEventSubscriptionsParams,
  SSEConnection,
  SSEConnectionOptions,
  SSEConnectionStatus,
  SSEEvent,
  // Automation types
  EventAlertConditionRule,
  EventAlertConditionRuleFieldValues,
  HumanValidation,
  EventResourceFilter,
  EventFilter,
  AlertConditionRule,
  AlertConditionRuleActor,
  AlertConditionRuleAction,
  AlertConditionRuleInsights,
  AlertConditionRuleInclude,
  AlertActionRule,
  AutomationAlertAction,
  AlertActionType,
  AlertActionSettings,
  NotificationSettings,
  SmsSettings,
  SmtpSettings,
  SlackSettings,
  WebhookSettings,
  OutputPortSettings,
  PlaySpeakerAudioClipSettings,
  ListEventAlertConditionRulesParams,
  GetEventAlertConditionRuleFieldValuesParams,
  ListAlertConditionRulesParams,
  GetAlertConditionRuleParams,
  ListAlertActionRulesParams,
  ListAlertActionsParams,
  // Job types
  Job,
  JobState,
  ListJobsParams,
  GetJobParams,
  // Export types
  ExportType,
  CreateExportParams,
  ExportJobResponse,
  // File types
  EenFile,
  FileType,
  FileIncludeField,
  ListFilesParams,
  GetFileParams,
  CreateFileParams,
  DownloadFileResult,
  // Download types
  Download,
  DownloadStatus,
  ListDownloadsParams,
  GetDownloadParams,
  DownloadDownloadResult,
  // PTZ types
  PtzPosition,
  PtzPositionResponse,
  PtzMoveType,
  PtzDirection,
  PtzStepSize,
  PtzPositionMove,
  PtzDirectionMove,
  PtzCenterOnMove,
  PtzMove,
  PtzPreset,
  PtzMode,
  PtzSettings,
  PtzSettingsUpdate
} from './types'

// Type helpers
export { success, failure } from './types'

// Utilities
export { formatTimestamp, getCameraStatusString, isStatusObject } from './utils'

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
  getCamera,
  getCameraSettings
} from './cameras'

// Bridges - Plain functions
export {
  getBridges,
  getBridge
} from './bridges'

// Layouts - Plain functions
export {
  getLayouts,
  getLayout,
  createLayout,
  updateLayout,
  deleteLayout
} from './layouts'

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
  listEventFieldValues,
  // Event data schema mapping
  EVENT_TYPE_DATA_SCHEMAS,
  getDataSchemasForEventType,
  getIncludeParameterForEventTypes,
  eventTypeHasDataSchemas,
  getEventTypesForDataSchema,
  getAllDataSchemas,
  getAllKnownEventTypes
} from './events'

// Event data schema types
export type { DataSchema, KnownEventType } from './events'

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

// EventSubscriptions - Plain functions
export {
  listEventSubscriptions,
  getEventSubscription,
  createEventSubscription,
  deleteEventSubscription,
  connectToEventSubscription
} from './eventSubscriptions'

// Automations - Plain functions
export {
  listEventAlertConditionRules,
  getEventAlertConditionRuleFieldValues,
  getEventAlertConditionRule,
  listAlertConditionRules,
  getAlertConditionRule,
  listAlertActionRules,
  getAlertActionRule,
  listAlertActions,
  getAlertAction
} from './automations'

// Exports - Plain functions
export {
  createExportJob
} from './exports'

// Jobs - Plain functions
export {
  listJobs,
  getJob,
  deleteJob
} from './jobs'

// Files - Plain functions
export {
  listFiles,
  getFile,
  addFile,
  downloadFile,
  deleteFile
} from './files'

// Downloads - Plain functions
export {
  listDownloads,
  getDownload,
  downloadDownload
} from './downloads'

// PTZ - Plain functions
export {
  getPtzPosition,
  movePtz,
  getPtzSettings,
  updatePtzSettings
} from './ptz'
