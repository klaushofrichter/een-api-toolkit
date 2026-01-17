**EEN API Toolkit v0.3.12**

***

# EEN API Toolkit v0.3.12

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

### Configuration

- [EenToolkitConfig](interfaces/EenToolkitConfig.md)

### Events

- [EventData](interfaces/EventData.md)
- [Event](interfaces/Event.md)
- [EventType](interfaces/EventType.md)
- [ListEventsParams](interfaces/ListEventsParams.md)
- [GetEventParams](interfaces/GetEventParams.md)
- [ListEventTypesParams](interfaces/ListEventTypesParams.md)
- [ListEventFieldValuesParams](interfaces/ListEventFieldValuesParams.md)
- [EventFieldValues](interfaces/EventFieldValues.md)

### Feeds

- [Feed](interfaces/Feed.md)
- [ListFeedsParams](interfaces/ListFeedsParams.md)
- [ListFeedsResult](interfaces/ListFeedsResult.md)

### Media

- [MediaInterval](interfaces/MediaInterval.md)
- [ListMediaParams](interfaces/ListMediaParams.md)
- [GetLiveImageParams](interfaces/GetLiveImageParams.md)
- [LiveImageResult](interfaces/LiveImageResult.md)
- [GetRecordedImageParams](interfaces/GetRecordedImageParams.md)
- [RecordedImageResult](interfaces/RecordedImageResult.md)
- [MediaSessionResponse](interfaces/MediaSessionResponse.md)
- [MediaSessionResult](interfaces/MediaSessionResult.md)

## Type Aliases

### Types

- [ErrorCode](type-aliases/ErrorCode.md)
- [Result](type-aliases/Result.md)

### Bridges

- [BridgeStatus](type-aliases/BridgeStatus.md)

### Cameras

- [CameraStatus](type-aliases/CameraStatus.md)

### Configuration

- [StorageStrategy](type-aliases/StorageStrategy.md)

### Events

- [ActorType](type-aliases/ActorType.md)

### Feeds

- [FeedStreamType](type-aliases/FeedStreamType.md)
- [FeedMediaType](type-aliases/FeedMediaType.md)
- [FeedIncludeOption](type-aliases/FeedIncludeOption.md)

### Media

- [MediaType](type-aliases/MediaType.md)
- [MediaStreamType](type-aliases/MediaStreamType.md)

## Variables

### Configuration

- [STORAGE\_STRATEGY\_DESCRIPTIONS](variables/STORAGE_STRATEGY_DESCRIPTIONS.md)

### Other

- [useAuthStore](variables/useAuthStore.md)

## Functions

### Users

- [getCurrentUser](functions/getCurrentUser.md)
- [getUsers](functions/getUsers.md)
- [getUser](functions/getUser.md)

### Bridges

- [getBridges](functions/getBridges.md)
- [getBridge](functions/getBridge.md)

### Cameras

- [getCameras](functions/getCameras.md)
- [getCamera](functions/getCamera.md)

### Configuration

- [getStorageStrategy](functions/getStorageStrategy.md)

### Events

- [listEvents](functions/listEvents.md)
- [getEvent](functions/getEvent.md)
- [listEventTypes](functions/listEventTypes.md)
- [listEventFieldValues](functions/listEventFieldValues.md)

### Feeds

- [listFeeds](functions/listFeeds.md)

### Media

- [listMedia](functions/listMedia.md)
- [getLiveImage](functions/getLiveImage.md)
- [getRecordedImage](functions/getRecordedImage.md)
- [getMediaSession](functions/getMediaSession.md)
- [initMediaSession](functions/initMediaSession.md)

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
