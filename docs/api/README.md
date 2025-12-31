**EEN API Toolkit v0.1.2**

***

# EEN API Toolkit v0.1.2

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

## Type Aliases

### Types

- [ErrorCode](type-aliases/ErrorCode.md)
- [Result](type-aliases/Result.md)

### Cameras

- [CameraStatus](type-aliases/CameraStatus.md)

## Variables

- [useAuthStore](variables/useAuthStore.md)

## Functions

### Users

- [getCurrentUser](functions/getCurrentUser.md)
- [getUsers](functions/getUsers.md)
- [getUser](functions/getUser.md)

### Cameras

- [getCameras](functions/getCameras.md)
- [getCamera](functions/getCamera.md)

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
