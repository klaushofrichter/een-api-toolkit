**EEN API Toolkit v0.0.4**

***

# EEN API Toolkit v0.0.4

## Interfaces

### Authentication

- [TokenResponse](interfaces/TokenResponse.md)

### Users

- [User](interfaces/User.md)
- [UserProfile](interfaces/UserProfile.md)
- [ListUsersParams](interfaces/ListUsersParams.md)
- [GetUserParams](interfaces/GetUserParams.md)
- [UseCurrentUserOptions](interfaces/UseCurrentUserOptions.md)
- [UseUsersOptions](interfaces/UseUsersOptions.md)
- [UseUserOptions](interfaces/UseUserOptions.md)

### Types

- [EenError](interfaces/EenError.md)
- [PaginationParams](interfaces/PaginationParams.md)
- [PaginatedResult](interfaces/PaginatedResult.md)

### Configuration

- [EenToolkitConfig](interfaces/EenToolkitConfig.md)

## Type Aliases

### Types

- [ErrorCode](type-aliases/ErrorCode.md)
- [Result](type-aliases/Result.md)

## Variables

- [useAuthStore](variables/useAuthStore.md)

## Functions

### Users

- [useCurrentUser](functions/useCurrentUser.md)
- [useUsers](functions/useUsers.md)
- [useUser](functions/useUser.md)
- [getCurrentUser](functions/getCurrentUser.md)
- [getUsers](functions/getUsers.md)
- [getUser](functions/getUser.md)

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
