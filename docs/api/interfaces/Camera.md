[**EEN API Toolkit v0.0.13**](../README.md)

***

[EEN API Toolkit](../README.md) / Camera

# Interface: Camera

Defined in: src/types/camera.ts:166

Camera entity from EEN API v3.0.

## Remarks

Represents a camera in the Eagle Eye Networks platform. Cameras can be
connected via bridges or directly to the cloud. They have various
properties including status, device info, and stream URLs.

For more details on camera management, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listcameras).

## Example

```typescript
import { getCameras, type Camera } from 'een-api-toolkit'

const { data, error } = await getCameras({ status__in: ['online'] })
if (data) {
  data.results.forEach((camera: Camera) => {
    console.log(`${camera.name}: ${camera.status}`)
  })
}
```

## Properties

### id

> **id**: `string`

Defined in: src/types/camera.ts:168

Unique identifier for the camera

***

### name

> **name**: `string`

Defined in: src/types/camera.ts:170

Display name of the camera

***

### accountId

> **accountId**: `string`

Defined in: src/types/camera.ts:172

ID of the account this camera belongs to

***

### bridgeId?

> `optional` **bridgeId**: `string` \| `null`

Defined in: src/types/camera.ts:174

ID of the bridge this camera is connected to (null for direct-to-cloud)

***

### locationId?

> `optional` **locationId**: `string` \| `null`

Defined in: src/types/camera.ts:176

ID of the location where the camera is installed

***

### guid?

> `optional` **guid**: `string`

Defined in: src/types/camera.ts:178

Globally unique identifier

***

### macAddress?

> `optional` **macAddress**: `string`

Defined in: src/types/camera.ts:180

MAC address of the camera

***

### ipAddress?

> `optional` **ipAddress**: `string`

Defined in: src/types/camera.ts:182

IP address of the camera on the local network

***

### timezone?

> `optional` **timezone**: `string`

Defined in: src/types/camera.ts:184

Timezone of the camera location (IANA timezone name)

***

### status?

> `optional` **status**: [`CameraStatus`](../type-aliases/CameraStatus.md)

Defined in: src/types/camera.ts:186

Current status of the camera

***

### tags?

> `optional` **tags**: `string`[]

Defined in: src/types/camera.ts:188

Tags assigned to this camera for organization

***

### packages?

> `optional` **packages**: `string`[]

Defined in: src/types/camera.ts:190

Feature packages enabled for this camera

***

### multiCameraId?

> `optional` **multiCameraId**: `string` \| `null`

Defined in: src/types/camera.ts:192

ID of multi-camera group if part of one

***

### speakerId?

> `optional` **speakerId**: `string` \| `null`

Defined in: src/types/camera.ts:194

ID of associated speaker device

***

### deviceInfo?

> `optional` **deviceInfo**: [`CameraDeviceInfo`](CameraDeviceInfo.md)

Defined in: src/types/camera.ts:196

Device information (make, model, firmware)

***

### shareDetails?

> `optional` **shareDetails**: [`CameraShareDetails`](CameraShareDetails.md)

Defined in: src/types/camera.ts:198

Share details if camera is shared

***

### streamUrls?

> `optional` **streamUrls**: [`CameraStreamUrls`](CameraStreamUrls.md)

Defined in: src/types/camera.ts:200

Stream URLs for accessing camera media

***

### rtspConnectionSettings?

> `optional` **rtspConnectionSettings**: [`CameraRtspConnectionSettings`](CameraRtspConnectionSettings.md)

Defined in: src/types/camera.ts:202

RTSP connection settings

***

### devicePosition?

> `optional` **devicePosition**: [`CameraDevicePosition`](CameraDevicePosition.md)

Defined in: src/types/camera.ts:204

Physical position of the camera

***

### enabledAnalytics?

> `optional` **enabledAnalytics**: `string`[]

Defined in: src/types/camera.ts:206

List of enabled analytics on this camera

***

### recordingModes?

> `optional` **recordingModes**: [`CameraRecordingModes`](CameraRecordingModes.md)

Defined in: src/types/camera.ts:208

Recording mode settings

***

### createdAt?

> `optional` **createdAt**: `string`

Defined in: src/types/camera.ts:210

ISO 8601 timestamp when the camera was created

***

### updatedAt?

> `optional` **updatedAt**: `string`

Defined in: src/types/camera.ts:212

ISO 8601 timestamp when the camera was last updated
