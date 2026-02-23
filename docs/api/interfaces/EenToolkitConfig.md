[**EEN API Toolkit v0.3.97**](../README.md)

***

[EEN API Toolkit](../README.md) / EenToolkitConfig

# Interface: EenToolkitConfig

Defined in: [types/common.ts:177](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L177)

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
  storageStrategy: 'sessionStorage', // More secure than default
  debug: true
})
```

## Properties

### proxyUrl?

> `optional` **proxyUrl**: `string`

Defined in: [types/common.ts:179](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L179)

URL of the OAuth proxy server (required for API calls)

***

### clientId?

> `optional` **clientId**: `string`

Defined in: [types/common.ts:181](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L181)

EEN OAuth client ID (required for authentication)

***

### redirectUri?

> `optional` **redirectUri**: `string`

Defined in: [types/common.ts:183](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L183)

OAuth redirect URI (default: http://127.0.0.1:3333)

***

### storageStrategy?

> `optional` **storageStrategy**: [`StorageStrategy`](../type-aliases/StorageStrategy.md)

Defined in: [types/common.ts:192](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L192)

Storage strategy for token persistence (default: 'localStorage').

Security vs convenience tradeoffs:
- 'localStorage': Persists across sessions, vulnerable to XSS
- 'sessionStorage': Per-tab isolation, cleared on tab close
- 'memory': Most secure, lost on page refresh

***

### debug?

> `optional` **debug**: `boolean`

Defined in: [types/common.ts:194](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L194)

Enable debug logging to console
