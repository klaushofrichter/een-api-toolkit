**EEN API Toolkit v0.2.0**

***

# EEN API Toolkit v0.2.0

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

### Feeds

- [FeedStreamType](type-aliases/FeedStreamType.md)
- [FeedMediaType](type-aliases/FeedMediaType.md)
- [FeedIncludeOption](type-aliases/FeedIncludeOption.md)

### Media

- [MediaType](type-aliases/MediaType.md)
- [MediaStreamType](type-aliases/MediaStreamType.md)

## Variables

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
