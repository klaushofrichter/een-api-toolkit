[**EEN API Toolkit v0.3.58**](../README.md)

***

[EEN API Toolkit](../README.md) / getCamera

# Function: getCamera()

> **getCamera**(`cameraId`, `params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Camera`](../interfaces/Camera.md)\>\>

Defined in: [src/cameras/service.ts:240](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/cameras/service.ts#L240)

Get a specific camera by ID.

## Parameters

### cameraId

`string`

The unique identifier of the camera to fetch

### params?

[`GetCameraParams`](../interfaces/GetCameraParams.md)

Optional parameters (e.g., include additional fields)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Camera`](../interfaces/Camera.md)\>\>

A Result containing the camera or an error

## Remarks

Fetches a single camera from `/api/v3.0/cameras/{cameraId}`. Use the `include`
parameter to request additional fields.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getcamera).

## Example

```typescript
import { getCamera } from 'een-api-toolkit'

const { data, error } = await getCamera('camera-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Camera not found')
  }
  return
}

console.log(`Camera: ${data.name} (${data.status})`)

// With additional fields
const { data: cameraWithDetails } = await getCamera('camera-123', {
  include: ['deviceInfo', 'streamUrls', 'shareDetails']
})
```
