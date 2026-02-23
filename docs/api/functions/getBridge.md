[**EEN API Toolkit v0.3.97**](../README.md)

***

[EEN API Toolkit](../README.md) / getBridge

# Function: getBridge()

> **getBridge**(`bridgeId`, `params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Bridge`](../interfaces/Bridge.md)\>\>

Defined in: [bridges/service.ts:189](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/bridges/service.ts#L189)

Get a specific bridge by ID.

## Parameters

### bridgeId

`string`

The unique identifier of the bridge to fetch

### params?

[`GetBridgeParams`](../interfaces/GetBridgeParams.md)

Optional parameters (e.g., include additional fields)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Bridge`](../interfaces/Bridge.md)\>\>

A Result containing the bridge or an error

## Remarks

Fetches a single bridge from `/api/v3.0/bridges/{bridgeId}`. Use the `include`
parameter to request additional fields.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getbridge).

## Example

```typescript
import { getBridge } from 'een-api-toolkit'

const { data, error } = await getBridge('bridge-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Bridge not found')
  }
  return
}

console.log(`Bridge: ${data.name} (${data.status})`)

// With additional fields
const { data: bridgeWithDetails } = await getBridge('bridge-123', {
  include: ['deviceInfo', 'networkInfo', 'status']
})
```
