[**EEN API Toolkit v0.3.63**](../README.md)

***

[EEN API Toolkit](../README.md) / TokenResponse

# Interface: TokenResponse

Defined in: [src/auth/service.ts:18](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/auth/service.ts#L18)

Token response from the OAuth proxy.

## Remarks

This is the response returned by the proxy's `/proxy/getAccessToken` endpoint
after successfully exchanging an authorization code for an access token.

## Properties

### accessToken

> **accessToken**: `string`

Defined in: [src/auth/service.ts:19](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/auth/service.ts#L19)

***

### expiresIn

> **expiresIn**: `number`

Defined in: [src/auth/service.ts:20](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/auth/service.ts#L20)

***

### httpsBaseUrl

> **httpsBaseUrl**: `string` \| \{ `hostname`: `string`; `port?`: `number`; \}

Defined in: [src/auth/service.ts:21](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/auth/service.ts#L21)

***

### userEmail

> **userEmail**: `string`

Defined in: [src/auth/service.ts:22](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/auth/service.ts#L22)

***

### sessionId

> **sessionId**: `string`

Defined in: [src/auth/service.ts:23](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/auth/service.ts#L23)
