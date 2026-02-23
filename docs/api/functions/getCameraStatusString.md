[**EEN API Toolkit v0.3.98**](../README.md)

***

[EEN API Toolkit](../README.md) / getCameraStatusString

# Function: getCameraStatusString()

> **getCameraStatusString**(`status?`): [`CameraStatus`](../type-aliases/CameraStatus.md) \| `undefined`

Defined in: [utils/camera.ts:35](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/utils/camera.ts#L35)

Extract the status string from a Camera's status field.

## Parameters

### status?

The camera status field value

[`CameraStatus`](../type-aliases/CameraStatus.md) | \{ `connectionStatus?`: CameraStatus \| undefined; \}

## Returns

[`CameraStatus`](../type-aliases/CameraStatus.md) \| `undefined`

The status string, or undefined if no status is present

## Remarks

The EEN API may return camera status as either:
- A string directly: `"online"`
- An object with connectionStatus: `{ connectionStatus: "online" }`

This depends on the `include` parameters used in the API request.
This utility safely extracts the status string from either format.

## Example

```typescript
import { getCameraStatusString, type Camera } from 'een-api-toolkit'

function displayCameraStatus(camera: Camera) {
  const status = getCameraStatusString(camera.status)
  console.log(`Camera ${camera.name} is ${status || 'unknown'}`)
}
```
