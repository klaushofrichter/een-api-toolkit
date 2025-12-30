[**EEN API Toolkit v0.0.19**](../README.md)

***

[EEN API Toolkit](../README.md) / EenToolkitConfig

# Interface: EenToolkitConfig

Defined in: [src/types/common.ts:155](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L155)

Configuration for initializing the toolkit.

## Remarks

Pass this to [initEenToolkit](../functions/initEenToolkit.md) to configure the library. All options
can also be set via environment variables (VITE_PROXY_URL, VITE_EEN_CLIENT_ID,
VITE_REDIRECT_URI, VITE_DEBUG).

## Example

```typescript
import { initEenToolkit } from 'een-api-toolkit'

initEenToolkit({
  proxyUrl: 'https://your-proxy.workers.dev',
  clientId: 'your-een-client-id',
  redirectUri: 'http://localhost:5173/callback',
  debug: true
})
```

## Properties

### proxyUrl?

> `optional` **proxyUrl**: `string`

Defined in: [src/types/common.ts:157](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L157)

URL of the OAuth proxy server (required for API calls)

***

### clientId?

> `optional` **clientId**: `string`

Defined in: [src/types/common.ts:159](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L159)

EEN OAuth client ID (required for authentication)

***

### redirectUri?

> `optional` **redirectUri**: `string`

Defined in: [src/types/common.ts:161](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L161)

OAuth redirect URI (default: http://127.0.0.1:3333)

***

### debug?

> `optional` **debug**: `boolean`

Defined in: [src/types/common.ts:163](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L163)

Enable debug logging to console
