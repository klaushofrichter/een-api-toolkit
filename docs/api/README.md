**EEN API Toolkit v0.3.98**

***

# EEN API Toolkit v0.3.98

## Interfaces

### Authentication

- [TokenResponse](interfaces/TokenResponse.md)

### Users

- [User](interfaces/User.md)
- [UserProfile](interfaces/UserProfile.md)
- [ListUsersParams](interfaces/ListUsersParams.md)
- [GetUserParams](interfaces/GetUserParams.md)

### Types

- [EenError](interfaces/EenError.md)
- [PaginationParams](interfaces/PaginationParams.md)
- [PaginatedResult](interfaces/PaginatedResult.md)

### Alerts

- [AlertAction](interfaces/AlertAction.md)
- [Alert](interfaces/Alert.md)
- [AlertType](interfaces/AlertType.md)
- [ListAlertsParams](interfaces/ListAlertsParams.md)
- [GetAlertParams](interfaces/GetAlertParams.md)
- [ListAlertTypesParams](interfaces/ListAlertTypesParams.md)

### Automations

- [HumanValidation](interfaces/HumanValidation.md)
- [EventResourceFilter](interfaces/EventResourceFilter.md)
- [EventFilter](interfaces/EventFilter.md)
- [EventAlertConditionRule](interfaces/EventAlertConditionRule.md)
- [EventAlertConditionRuleFieldValues](interfaces/EventAlertConditionRuleFieldValues.md)
- [AlertConditionRuleActor](interfaces/AlertConditionRuleActor.md)
- [AlertConditionRuleAction](interfaces/AlertConditionRuleAction.md)
- [AlertConditionRuleInsights](interfaces/AlertConditionRuleInsights.md)
- [AlertConditionRule](interfaces/AlertConditionRule.md)
- [AlertActionRule](interfaces/AlertActionRule.md)
- [NotificationSettings](interfaces/NotificationSettings.md)
- [SmsSettings](interfaces/SmsSettings.md)
- [SmtpSettings](interfaces/SmtpSettings.md)
- [SlackSettings](interfaces/SlackSettings.md)
- [WebhookSettings](interfaces/WebhookSettings.md)
- [OutputPortSettings](interfaces/OutputPortSettings.md)
- [PlaySpeakerAudioClipSettings](interfaces/PlaySpeakerAudioClipSettings.md)
- [AutomationAlertAction](interfaces/AutomationAlertAction.md)
- [ListEventAlertConditionRulesParams](interfaces/ListEventAlertConditionRulesParams.md)
- [GetEventAlertConditionRuleFieldValuesParams](interfaces/GetEventAlertConditionRuleFieldValuesParams.md)
- [ListAlertConditionRulesParams](interfaces/ListAlertConditionRulesParams.md)
- [GetAlertConditionRuleParams](interfaces/GetAlertConditionRuleParams.md)
- [ListAlertActionRulesParams](interfaces/ListAlertActionRulesParams.md)
- [ListAlertActionsParams](interfaces/ListAlertActionsParams.md)

### Bridges

- [BridgeDeviceInfo](interfaces/BridgeDeviceInfo.md)
- [BridgeNetworkInfo](interfaces/BridgeNetworkInfo.md)
- [BridgeDevicePosition](interfaces/BridgeDevicePosition.md)
- [Bridge](interfaces/Bridge.md)
- [ListBridgesParams](interfaces/ListBridgesParams.md)
- [GetBridgeParams](interfaces/GetBridgeParams.md)

### Cameras

- [CameraDeviceInfo](interfaces/CameraDeviceInfo.md)
- [CameraShareDetails](interfaces/CameraShareDetails.md)
- [CameraStreamUrls](interfaces/CameraStreamUrls.md)
- [CameraRtspConnectionSettings](interfaces/CameraRtspConnectionSettings.md)
- [CameraDevicePosition](interfaces/CameraDevicePosition.md)
- [CameraRecordingModes](interfaces/CameraRecordingModes.md)
- [Camera](interfaces/Camera.md)
- [ListCamerasParams](interfaces/ListCamerasParams.md)
- [GetCameraParams](interfaces/GetCameraParams.md)
- [GetCameraSettingsParams](interfaces/GetCameraSettingsParams.md)
- [CameraSettingsRetention](interfaces/CameraSettingsRetention.md)
- [CameraSettingsAudio](interfaces/CameraSettingsAudio.md)
- [CameraSettingsPreviewVideo](interfaces/CameraSettingsPreviewVideo.md)
- [CameraSettingsMainVideo](interfaces/CameraSettingsMainVideo.md)
- [CameraSettingsAnalog](interfaces/CameraSettingsAnalog.md)
- [CameraSettingsScheduledOverride](interfaces/CameraSettingsScheduledOverride.md)
- [CameraSettingsOperating](interfaces/CameraSettingsOperating.md)
- [CameraSettingsTalkdown](interfaces/CameraSettingsTalkdown.md)
- [CameraSettingsCredentials](interfaces/CameraSettingsCredentials.md)
- [CameraSettingsData](interfaces/CameraSettingsData.md)
- [CameraSettings](interfaces/CameraSettings.md)

### Configuration

- [EenToolkitConfig](interfaces/EenToolkitConfig.md)

### Downloads

- [Download](interfaces/Download.md)
- [ListDownloadsParams](interfaces/ListDownloadsParams.md)
- [GetDownloadParams](interfaces/GetDownloadParams.md)

### Event Metrics

- [EventMetric](interfaces/EventMetric.md)
- [GetEventMetricsParams](interfaces/GetEventMetricsParams.md)

### EventSubscriptions

- [EventSubscriptionConfig](interfaces/EventSubscriptionConfig.md)
- [SSEDeliveryConfig](interfaces/SSEDeliveryConfig.md)
- [WebhookDeliveryConfig](interfaces/WebhookDeliveryConfig.md)
- [EventTypeFilter](interfaces/EventTypeFilter.md)
- [EventSubscriptionFilter](interfaces/EventSubscriptionFilter.md)
- [FilterCreate](interfaces/FilterCreate.md)
- [EventSubscription](interfaces/EventSubscription.md)
- [SSEDeliveryConfigCreate](interfaces/SSEDeliveryConfigCreate.md)
- [WebhookDeliveryConfigCreate](interfaces/WebhookDeliveryConfigCreate.md)
- [CreateEventSubscriptionParams](interfaces/CreateEventSubscriptionParams.md)
- [ListEventSubscriptionsParams](interfaces/ListEventSubscriptionsParams.md)
- [SSEConnection](interfaces/SSEConnection.md)
- [SSEConnectionOptions](interfaces/SSEConnectionOptions.md)
- [SSEEvent](interfaces/SSEEvent.md)

### Events

- [EventData](interfaces/EventData.md)
- [Event](interfaces/Event.md)
- [EventType](interfaces/EventType.md)
- [ListEventsParams](interfaces/ListEventsParams.md)
- [GetEventParams](interfaces/GetEventParams.md)
- [ListEventTypesParams](interfaces/ListEventTypesParams.md)
- [ListEventFieldValuesParams](interfaces/ListEventFieldValuesParams.md)
- [EventFieldValues](interfaces/EventFieldValues.md)

### Exports

- [CreateExportParams](interfaces/CreateExportParams.md)

### Feeds

- [Feed](interfaces/Feed.md)
- [ListFeedsParams](interfaces/ListFeedsParams.md)
- [ListFeedsResult](interfaces/ListFeedsResult.md)

### Files

- [EenFile](interfaces/EenFile.md)
- [ListFilesParams](interfaces/ListFilesParams.md)
- [GetFileParams](interfaces/GetFileParams.md)
- [CreateFileParams](interfaces/CreateFileParams.md)
- [DownloadFileResult](interfaces/DownloadFileResult.md)

### Jobs

- [Job](interfaces/Job.md)
- [ListJobsParams](interfaces/ListJobsParams.md)
- [GetJobParams](interfaces/GetJobParams.md)

### Layouts

- [CameraStatusCounts](interfaces/CameraStatusCounts.md)
- [LayoutPermissions](interfaces/LayoutPermissions.md)
- [LayoutPane](interfaces/LayoutPane.md)
- [LayoutSettings](interfaces/LayoutSettings.md)
- [Layout](interfaces/Layout.md)
- [ListLayoutsParams](interfaces/ListLayoutsParams.md)
- [GetLayoutParams](interfaces/GetLayoutParams.md)
- [CreateLayoutParams](interfaces/CreateLayoutParams.md)
- [UpdateLayoutParams](interfaces/UpdateLayoutParams.md)

### Media

- [MediaInterval](interfaces/MediaInterval.md)
- [ListMediaParams](interfaces/ListMediaParams.md)
- [GetLiveImageParams](interfaces/GetLiveImageParams.md)
- [LiveImageResult](interfaces/LiveImageResult.md)
- [GetRecordedImageParams](interfaces/GetRecordedImageParams.md)
- [RecordedImageResult](interfaces/RecordedImageResult.md)
- [MediaSessionResponse](interfaces/MediaSessionResponse.md)
- [MediaSessionResult](interfaces/MediaSessionResult.md)

### Notifications

- [Notification](interfaces/Notification.md)
- [ListNotificationsParams](interfaces/ListNotificationsParams.md)

### PTZ

- [PtzPosition](interfaces/PtzPosition.md)
- [PtzPositionResponse](interfaces/PtzPositionResponse.md)
- [PtzPositionMove](interfaces/PtzPositionMove.md)
- [PtzDirectionMove](interfaces/PtzDirectionMove.md)
- [PtzCenterOnMove](interfaces/PtzCenterOnMove.md)
- [PtzPreset](interfaces/PtzPreset.md)
- [PtzSettings](interfaces/PtzSettings.md)
- [PtzSettingsUpdate](interfaces/PtzSettingsUpdate.md)

## Type Aliases

### Types

- [ErrorCode](type-aliases/ErrorCode.md)
- [Result](type-aliases/Result.md)

### Alerts

- [AlertInclude](type-aliases/AlertInclude.md)
- [AlertSort](type-aliases/AlertSort.md)
- [AlertActionStatus](type-aliases/AlertActionStatus.md)

### Automations

- [AlertActionType](type-aliases/AlertActionType.md)
- [AlertActionSettings](type-aliases/AlertActionSettings.md)
- [AlertConditionRuleInclude](type-aliases/AlertConditionRuleInclude.md)

### Bridges

- [BridgeStatus](type-aliases/BridgeStatus.md)

### Cameras

- [CameraStatus](type-aliases/CameraStatus.md)
- [CameraSettingsInclude](type-aliases/CameraSettingsInclude.md)

### Configuration

- [StorageStrategy](type-aliases/StorageStrategy.md)

### Downloads

- [DownloadStatus](type-aliases/DownloadStatus.md)
- [DownloadDownloadResult](type-aliases/DownloadDownloadResult.md)

### Event Metrics

- [MetricActorType](type-aliases/MetricActorType.md)
- [MetricDataPoint](type-aliases/MetricDataPoint.md)

### EventSubscriptions

- [EventSubscriptionLifecycle](type-aliases/EventSubscriptionLifecycle.md)
- [EventSubscriptionDeliveryType](type-aliases/EventSubscriptionDeliveryType.md)
- [DeliveryConfig](type-aliases/DeliveryConfig.md)
- [DeliveryConfigCreate](type-aliases/DeliveryConfigCreate.md)
- [SSEConnectionStatus](type-aliases/SSEConnectionStatus.md)

### Events

- [DataSchema](type-aliases/DataSchema.md)
- [KnownEventType](type-aliases/KnownEventType.md)
- [ActorType](type-aliases/ActorType.md)

### Exports

- [ExportType](type-aliases/ExportType.md)
- [ExportJobResponse](type-aliases/ExportJobResponse.md)

### Feeds

- [FeedStreamType](type-aliases/FeedStreamType.md)
- [FeedMediaType](type-aliases/FeedMediaType.md)
- [FeedIncludeOption](type-aliases/FeedIncludeOption.md)

### Files

- [FileType](type-aliases/FileType.md)
- [FileIncludeField](type-aliases/FileIncludeField.md)

### Jobs

- [JobState](type-aliases/JobState.md)

### Layouts

- [LayoutPaneType](type-aliases/LayoutPaneType.md)
- [LayoutPaneSize](type-aliases/LayoutPaneSize.md)
- [CameraAspectRatio](type-aliases/CameraAspectRatio.md)
- [ListLayoutsInclude](type-aliases/ListLayoutsInclude.md)
- [ListLayoutsSort](type-aliases/ListLayoutsSort.md)
- [GetLayoutInclude](type-aliases/GetLayoutInclude.md)

### Media

- [MediaType](type-aliases/MediaType.md)
- [MediaStreamType](type-aliases/MediaStreamType.md)

### Notifications

- [NotificationCategory](type-aliases/NotificationCategory.md)
- [NotificationStatus](type-aliases/NotificationStatus.md)

### PTZ

- [PtzMoveType](type-aliases/PtzMoveType.md)
- [PtzDirection](type-aliases/PtzDirection.md)
- [PtzStepSize](type-aliases/PtzStepSize.md)
- [PtzMove](type-aliases/PtzMove.md)
- [PtzMode](type-aliases/PtzMode.md)

## Variables

### Configuration

- [STORAGE\_STRATEGY\_DESCRIPTIONS](variables/STORAGE_STRATEGY_DESCRIPTIONS.md)

### Events

- [EVENT\_TYPE\_DATA\_SCHEMAS](variables/EVENT_TYPE_DATA_SCHEMAS.md)

### Other

- [useAuthStore](variables/useAuthStore.md)

## Functions

### Users

- [getCurrentUser](functions/getCurrentUser.md)
- [getUsers](functions/getUsers.md)
- [getUser](functions/getUser.md)

### Alerts

- [listAlerts](functions/listAlerts.md)
- [getAlert](functions/getAlert.md)
- [listAlertTypes](functions/listAlertTypes.md)

### Automations

- [listEventAlertConditionRules](functions/listEventAlertConditionRules.md)
- [getEventAlertConditionRuleFieldValues](functions/getEventAlertConditionRuleFieldValues.md)
- [getEventAlertConditionRule](functions/getEventAlertConditionRule.md)
- [listAlertConditionRules](functions/listAlertConditionRules.md)
- [getAlertConditionRule](functions/getAlertConditionRule.md)
- [listAlertActionRules](functions/listAlertActionRules.md)
- [getAlertActionRule](functions/getAlertActionRule.md)
- [listAlertActions](functions/listAlertActions.md)
- [getAlertAction](functions/getAlertAction.md)

### Bridges

- [getBridges](functions/getBridges.md)
- [getBridge](functions/getBridge.md)

### Cameras

- [getCameras](functions/getCameras.md)
- [getCamera](functions/getCamera.md)
- [getCameraSettings](functions/getCameraSettings.md)

### Configuration

- [getStorageStrategy](functions/getStorageStrategy.md)

### Downloads

- [listDownloads](functions/listDownloads.md)
- [getDownload](functions/getDownload.md)
- [downloadDownload](functions/downloadDownload.md)

### Event Metrics

- [getEventMetrics](functions/getEventMetrics.md)

### EventSubscriptions

- [listEventSubscriptions](functions/listEventSubscriptions.md)
- [getEventSubscription](functions/getEventSubscription.md)
- [createEventSubscription](functions/createEventSubscription.md)
- [deleteEventSubscription](functions/deleteEventSubscription.md)
- [connectToEventSubscription](functions/connectToEventSubscription.md)

### Events

- [getDataSchemasForEventType](functions/getDataSchemasForEventType.md)
- [getIncludeParameterForEventTypes](functions/getIncludeParameterForEventTypes.md)
- [eventTypeHasDataSchemas](functions/eventTypeHasDataSchemas.md)
- [getEventTypesForDataSchema](functions/getEventTypesForDataSchema.md)
- [getAllDataSchemas](functions/getAllDataSchemas.md)
- [getAllKnownEventTypes](functions/getAllKnownEventTypes.md)
- [listEvents](functions/listEvents.md)
- [getEvent](functions/getEvent.md)
- [listEventTypes](functions/listEventTypes.md)
- [listEventFieldValues](functions/listEventFieldValues.md)

### Exports

- [createExportJob](functions/createExportJob.md)

### Feeds

- [listFeeds](functions/listFeeds.md)

### Files

- [listFiles](functions/listFiles.md)
- [getFile](functions/getFile.md)
- [addFile](functions/addFile.md)
- [downloadFile](functions/downloadFile.md)
- [deleteFile](functions/deleteFile.md)

### Jobs

- [listJobs](functions/listJobs.md)
- [getJob](functions/getJob.md)
- [deleteJob](functions/deleteJob.md)

### Layouts

- [getLayouts](functions/getLayouts.md)
- [getLayout](functions/getLayout.md)
- [createLayout](functions/createLayout.md)
- [updateLayout](functions/updateLayout.md)
- [deleteLayout](functions/deleteLayout.md)

### Media

- [listMedia](functions/listMedia.md)
- [getLiveImage](functions/getLiveImage.md)
- [getRecordedImage](functions/getRecordedImage.md)
- [getMediaSession](functions/getMediaSession.md)
- [initMediaSession](functions/initMediaSession.md)

### Notifications

- [listNotifications](functions/listNotifications.md)
- [getNotification](functions/getNotification.md)

### Other

- [getAuthUrl](functions/getAuthUrl.md)
- [getAccessToken](functions/getAccessToken.md)
- [refreshToken](functions/refreshToken.md)
- [revokeToken](functions/revokeToken.md)
- [handleAuthCallback](functions/handleAuthCallback.md)
- [initEenToolkit](functions/initEenToolkit.md)
- [getConfig](functions/getConfig.md)
- [getProxyUrl](functions/getProxyUrl.md)
- [getClientId](functions/getClientId.md)
- [getRedirectUri](functions/getRedirectUri.md)

### PTZ

- [getPtzPosition](functions/getPtzPosition.md)
- [movePtz](functions/movePtz.md)
- [getPtzSettings](functions/getPtzSettings.md)
- [updatePtzSettings](functions/updatePtzSettings.md)

### Utilities

- [getCameraStatusString](functions/getCameraStatusString.md)
- [isStatusObject](functions/isStatusObject.md)
- [formatTimestamp](functions/formatTimestamp.md)
