[**EEN API Toolkit v0.3.66**](../README.md)

***

[EEN API Toolkit](../README.md) / isStatusObject

# Function: isStatusObject()

> **isStatusObject**(`status?`): `status is { connectionStatus?: CameraStatus }`

Defined in: [src/utils/camera.ts:70](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/utils/camera.ts#L70)

TypeScript type guard to check if a status value is an object with connectionStatus.

## Parameters

### status?

The camera status field value

[`CameraStatus`](../type-aliases/CameraStatus.md) | \{ `connectionStatus?`: CameraStatus \| undefined; \}

## Returns

`status is { connectionStatus?: CameraStatus }`

True if status is an object (not a string), false otherwise

## Remarks

Use this type guard to help TypeScript narrow the camera status type when
you need to handle both string and object formats differently.

## Example

```typescript
import { isStatusObject, type Camera } from 'een-api-toolkit'

function processCameraStatus(camera: Camera) {
  if (isStatusObject(camera.status)) {
    // TypeScript knows camera.status is { connectionStatus?: CameraStatus }
    console.log('Status object:', camera.status.connectionStatus)
  } else {
    // TypeScript knows camera.status is CameraStatus | undefined
    console.log('Status string:', camera.status)
  }
}
```
