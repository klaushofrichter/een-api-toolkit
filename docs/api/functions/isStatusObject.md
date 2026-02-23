[**EEN API Toolkit v0.3.101**](../README.md)

***

[EEN API Toolkit](../README.md) / isStatusObject

# Function: isStatusObject()

> **isStatusObject**(`status?`): `status is { connectionStatus?: CameraStatus }`

Defined in: [utils/camera.ts:75](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/utils/camera.ts#L75)

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

**Implementation Note:** This function returns true for ANY non-null object to match
the EEN API's flexible response format. The API may return different object structures
depending on the `include` parameters, so we intentionally use a broad check rather than
validating specific properties like `'connectionStatus' in status`.

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
