[**EEN API Toolkit v0.3.95**](../README.md)

***

[EEN API Toolkit](../README.md) / getPtzPosition

# Function: getPtzPosition()

> **getPtzPosition**(`cameraId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PtzPositionResponse`](../interfaces/PtzPositionResponse.md)\>\>

Defined in: [ptz/service.ts:31](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/ptz/service.ts#L31)

Get the current PTZ position of a camera.

## Parameters

### cameraId

`string`

The unique identifier of the PTZ camera

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PtzPositionResponse`](../interfaces/PtzPositionResponse.md)\>\>

A Result containing the current PTZ position or an error

## Remarks

Fetches the current pan, tilt, and zoom coordinates from
`/api/v3.0/cameras/{cameraId}/ptz/position`.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getptzposition).

## Example

```typescript
import { getPtzPosition } from 'een-api-toolkit'

const { data, error } = await getPtzPosition('camera-123')
if (data) {
  console.log(`Pan: ${data.x}, Tilt: ${data.y}, Zoom: ${data.z}`)
}
```
