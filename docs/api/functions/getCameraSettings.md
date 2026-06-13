[**EEN API Toolkit v0.3.110**](../README.md)

***

[EEN API Toolkit](../README.md) / getCameraSettings

# Function: getCameraSettings()

> **getCameraSettings**(`cameraId`, `params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`CameraSettings`](../interfaces/CameraSettings.md)\>\>

Defined in: [cameras/service.ts:303](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/cameras/service.ts#L303)

Get operational settings for a specific camera.

## Parameters

### cameraId

`string`

The unique identifier of the camera

### params?

[`GetCameraSettingsParams`](../interfaces/GetCameraSettingsParams.md)

Optional parameters (e.g., include schema or proposedValues)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`CameraSettings`](../interfaces/CameraSettings.md)\>\>

A Result containing the camera settings or an error

## Remarks

Fetches camera settings from `/api/v3.0/cameras/{cameraId}/settings`.
Returns retention, audio, video, operating, and other settings.
Use the `include` parameter to request additional data like JSON Schema
or proposed values.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getcamerasettings).

## Example

```typescript
import { getCameraSettings } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getCameraSettings('camera-123')
if (data) {
  console.log('Retention:', data.data.retention?.cloudDays, 'days')
}

// With schema and proposed values
const { data: settings } = await getCameraSettings('camera-123', {
  include: ['schema', 'proposedValues']
})
```
