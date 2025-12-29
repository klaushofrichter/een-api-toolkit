[**EEN API Toolkit v0.0.14**](../README.md)

***

[EEN API Toolkit](../README.md) / handleAuthCallback

# Function: handleAuthCallback()

> **handleAuthCallback**(`code`, `state`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`TokenResponse`](../interfaces/TokenResponse.md)\>\>

Defined in: [src/auth/service.ts:181](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/auth/service.ts#L181)

Handle OAuth callback - validates state and exchanges code for token

## Parameters

### code

`string`

### state

`string`

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`TokenResponse`](../interfaces/TokenResponse.md)\>\>
