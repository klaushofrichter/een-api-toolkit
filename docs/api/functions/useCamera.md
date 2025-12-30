[**EEN API Toolkit v0.0.16**](../README.md)

***

[EEN API Toolkit](../README.md) / useCamera

# Function: useCamera()

> **useCamera**(`cameraId`, `options?`): `object`

Defined in: [src/cameras/composables.ts:231](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/cameras/composables.ts#L231)

Vue 3 composable for getting a single camera by ID.

## Parameters

### cameraId

The camera ID (string or getter function)

`string` | () => `string`

### options?

[`UseCameraOptions`](../interfaces/UseCameraOptions.md)

Configuration options

## Returns

Reactive camera state and control functions

### camera

> **camera**: `Ref`\<\{ `id`: `string`; `name`: `string`; `accountId`: `string`; `bridgeId?`: `string` \| `null`; `locationId?`: `string` \| `null`; `guid?`: `string`; `macAddress?`: `string`; `ipAddress?`: `string`; `timezone?`: `string`; `status?`: [`CameraStatus`](../type-aliases/CameraStatus.md) \| \{ `connectionStatus?`: CameraStatus \| undefined; \}; `tags?`: `string`[]; `packages?`: `string`[]; `multiCameraId?`: `string` \| `null`; `speakerId?`: `string` \| `null`; `deviceInfo?`: \{ `make?`: `string`; `model?`: `string`; `firmwareVersion?`: `string`; `directToCloud?`: `boolean`; `serialNumber?`: `string`; `resolution?`: `string`; `type?`: `string`; \}; `shareDetails?`: \{ `shared?`: `boolean`; `accountId?`: `string`; `firstResponder?`: `boolean`; `permissions?`: `string`[]; \}; `streamUrls?`: \{ `hls?`: `string`; `rtsp?`: `string`; `webrtc?`: `string`; `jpeg?`: `string`; \}; `rtspConnectionSettings?`: \{ `url?`: `string`; `username?`: `string`; `password?`: `string`; `transport?`: `"tcp"` \| `"udp"`; \}; `devicePosition?`: \{ `latitude?`: `number`; `longitude?`: `number`; `altitude?`: `number`; `floor?`: `number`; `azimuth?`: `number`; \}; `enabledAnalytics?`: `string`[]; `recordingModes?`: \{ `continuous?`: `boolean`; `motion?`: `boolean`; `scheduled?`: `boolean`; \}; `createdAt?`: `string`; `updatedAt?`: `string`; \} \| `null`, [`Camera`](../interfaces/Camera.md) \| \{ `id`: `string`; `name`: `string`; `accountId`: `string`; `bridgeId?`: `string` \| `null`; `locationId?`: `string` \| `null`; `guid?`: `string`; `macAddress?`: `string`; `ipAddress?`: `string`; `timezone?`: `string`; `status?`: [`CameraStatus`](../type-aliases/CameraStatus.md) \| \{ `connectionStatus?`: CameraStatus \| undefined; \}; `tags?`: `string`[]; `packages?`: `string`[]; `multiCameraId?`: `string` \| `null`; `speakerId?`: `string` \| `null`; `deviceInfo?`: \{ `make?`: `string`; `model?`: `string`; `firmwareVersion?`: `string`; `directToCloud?`: `boolean`; `serialNumber?`: `string`; `resolution?`: `string`; `type?`: `string`; \}; `shareDetails?`: \{ `shared?`: `boolean`; `accountId?`: `string`; `firstResponder?`: `boolean`; `permissions?`: `string`[]; \}; `streamUrls?`: \{ `hls?`: `string`; `rtsp?`: `string`; `webrtc?`: `string`; `jpeg?`: `string`; \}; `rtspConnectionSettings?`: \{ `url?`: `string`; `username?`: `string`; `password?`: `string`; `transport?`: `"tcp"` \| `"udp"`; \}; `devicePosition?`: \{ `latitude?`: `number`; `longitude?`: `number`; `altitude?`: `number`; `floor?`: `number`; `azimuth?`: `number`; \}; `enabledAnalytics?`: `string`[]; `recordingModes?`: \{ `continuous?`: `boolean`; `motion?`: `boolean`; `scheduled?`: `boolean`; \}; `createdAt?`: `string`; `updatedAt?`: `string`; \} \| `null`\>

The camera, or null if not loaded

### loading

> **loading**: `Ref`\<`boolean`, `boolean`\>

Whether a fetch is in progress

### error

> **error**: `Ref`\<\{ `code`: [`ErrorCode`](../type-aliases/ErrorCode.md); `message`: `string`; `status?`: `number`; `details?`: `unknown`; \} \| `null`, [`EenError`](../interfaces/EenError.md) \| \{ `code`: [`ErrorCode`](../type-aliases/ErrorCode.md); `message`: `string`; `status?`: `number`; `details?`: `unknown`; \} \| `null`\>

The last error that occurred, or null if successful

### fetch()

> **fetch**: (`params?`) => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Camera`](../interfaces/Camera.md)\>\>

#### Parameters

##### params?

[`GetCameraParams`](../interfaces/GetCameraParams.md)

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Camera`](../interfaces/Camera.md)\>\>

### refresh()

> **refresh**: () => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Camera`](../interfaces/Camera.md)\>\>

Refresh the camera data

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Camera`](../interfaces/Camera.md)\>\>

## Remarks

Provides reactive access to a specific camera. The camera ID can be provided
as a string or a getter function (useful for reactive route params).

## Examples

```vue
<script setup>
import { useCamera } from 'een-api-toolkit'
import { useRoute } from 'vue-router'

const route = useRoute()

// Static ID
const { camera, loading, error } = useCamera('camera-123')

// Or reactive ID from route
const { camera: routeCamera } = useCamera(() => route.params.id as string)
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else-if="camera">
    <h1>{{ camera.name }}</h1>
    <p>Status: {{ camera.status }}</p>
  </div>
</template>
```

```typescript
// With additional fields
const { camera } = useCamera('camera-123', {
  include: ['deviceInfo', 'status', 'shareDetails']
})

// Access device info when loaded
watchEffect(() => {
  if (camera.value?.deviceInfo) {
    console.log('Camera make:', camera.value.deviceInfo.make)
  }
})
```
