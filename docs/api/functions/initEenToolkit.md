[**EEN API Toolkit v0.3.64**](../README.md)

***

[EEN API Toolkit](../README.md) / initEenToolkit

# Function: initEenToolkit()

> **initEenToolkit**(`options`): `void`

Defined in: [src/config.ts:36](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/config.ts#L36)

Initialize the EEN API Toolkit

## Parameters

### options

[`EenToolkitConfig`](../interfaces/EenToolkitConfig.md) = `{}`

Configuration options for the toolkit

## Returns

`void`

## Remarks

Call this function once at application startup before using any toolkit features.
The storage strategy determines how authentication tokens are persisted.

## Example

```typescript
import { initEenToolkit } from 'een-api-toolkit'

// Basic initialization with localStorage (default, backwards compatible)
initEenToolkit({
  proxyUrl: 'https://your-proxy.workers.dev',
  clientId: 'your-client-id'
})

// High-security initialization with memory-only storage
initEenToolkit({
  proxyUrl: 'https://your-proxy.workers.dev',
  clientId: 'your-client-id',
  storageStrategy: 'memory'
})
```
