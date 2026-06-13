[**EEN API Toolkit v0.3.110**](../README.md)

***

[EEN API Toolkit](../README.md) / Camera

# Interface: Camera

Defined in: [types/camera.ts:166](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L166)

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

Defined in: [types/camera.ts:168](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L168)

Unique identifier for the camera

***

### name

> **name**: `string`

Defined in: [types/camera.ts:170](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L170)

Display name of the camera

***

### accountId

> **accountId**: `string`

Defined in: [types/camera.ts:172](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L172)

ID of the account this camera belongs to

***

### bridgeId?

> `optional` **bridgeId?**: `string` \| `null`

Defined in: [types/camera.ts:174](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L174)

ID of the bridge this camera is connected to (null for direct-to-cloud)

***

### locationId?

> `optional` **locationId?**: `string` \| `null`

Defined in: [types/camera.ts:176](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L176)

ID of the location where the camera is installed

***

### guid?

> `optional` **guid?**: `string`

Defined in: [types/camera.ts:178](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L178)

Globally unique identifier

***

### macAddress?

> `optional` **macAddress?**: `string`

Defined in: [types/camera.ts:180](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L180)

MAC address of the camera

***

### ipAddress?

> `optional` **ipAddress?**: `string`

Defined in: [types/camera.ts:182](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L182)

IP address of the camera on the local network

***

### timezone?

> `optional` **timezone?**: `string`

Defined in: [types/camera.ts:184](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L184)

Timezone of the camera location (IANA timezone name)

***

### status?

> `optional` **status?**: [`CameraStatus`](../type-aliases/CameraStatus.md) \| \{ `connectionStatus?`: CameraStatus \| undefined; \}

Defined in: [types/camera.ts:208](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L208)

Current status of the camera.

#### Remarks

The API may return status as either a string (`CameraStatus`) or an object
with a `connectionStatus` property, depending on the `include` parameters.

Use the helper function to safely extract the status string:
```typescript
function getStatusString(status?: CameraStatus | { connectionStatus?: CameraStatus }): CameraStatus | undefined {
  if (!status) return undefined
  if (typeof status === 'string') return status
  return status.connectionStatus
}
```

Or use optional chaining with type guards:
```typescript
const statusValue = typeof camera.status === 'string'
  ? camera.status
  : camera.status?.connectionStatus
```

***

### tags?

> `optional` **tags?**: `string`[]

Defined in: [types/camera.ts:210](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L210)

Tags assigned to this camera for organization

***

### packages?

> `optional` **packages?**: `string`[]

Defined in: [types/camera.ts:212](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L212)

Feature packages enabled for this camera

***

### multiCameraId?

> `optional` **multiCameraId?**: `string` \| `null`

Defined in: [types/camera.ts:214](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L214)

ID of multi-camera group if part of one

***

### speakerId?

> `optional` **speakerId?**: `string` \| `null`

Defined in: [types/camera.ts:216](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L216)

ID of associated speaker device

***

### deviceInfo?

> `optional` **deviceInfo?**: [`CameraDeviceInfo`](CameraDeviceInfo.md)

Defined in: [types/camera.ts:218](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L218)

Device information (make, model, firmware)

***

### shareDetails?

> `optional` **shareDetails?**: [`CameraShareDetails`](CameraShareDetails.md)

Defined in: [types/camera.ts:220](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L220)

Share details if camera is shared

***

### streamUrls?

> `optional` **streamUrls?**: [`CameraStreamUrls`](CameraStreamUrls.md)

Defined in: [types/camera.ts:222](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L222)

Stream URLs for accessing camera media

***

### rtspConnectionSettings?

> `optional` **rtspConnectionSettings?**: [`CameraRtspConnectionSettings`](CameraRtspConnectionSettings.md)

Defined in: [types/camera.ts:224](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L224)

RTSP connection settings

***

### devicePosition?

> `optional` **devicePosition?**: [`CameraDevicePosition`](CameraDevicePosition.md)

Defined in: [types/camera.ts:226](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L226)

Physical position of the camera

***

### capabilities?

> `optional` **capabilities?**: `object`

Defined in: [types/camera.ts:228](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L228)

Capabilities of the camera (returned when `include: ['capabilities']` is requested)

#### ptz?

> `optional` **ptz?**: `object`

##### ptz.capable?

> `optional` **capable?**: `boolean`

Whether this camera supports PTZ controls

##### ptz.fisheye?

> `optional` **fisheye?**: `boolean`

Whether this is a fisheye camera (not a true PTZ camera)

##### ptz.panTilt?

> `optional` **panTilt?**: `boolean`

Whether the camera supports pan/tilt movements

##### ptz.zoom?

> `optional` **zoom?**: `boolean`

Whether the camera supports zoom

##### ptz.positionMove?

> `optional` **positionMove?**: `boolean`

Whether the camera supports absolute position moves

##### ptz.directionMove?

> `optional` **directionMove?**: `boolean`

Whether the camera supports directional moves

##### ptz.centerOnMove?

> `optional` **centerOnMove?**: `boolean`

Whether the camera supports center-on moves

***

### enabledAnalytics?

> `optional` **enabledAnalytics?**: `string`[]

Defined in: [types/camera.ts:247](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L247)

List of enabled analytics on this camera

***

### recordingModes?

> `optional` **recordingModes?**: [`CameraRecordingModes`](CameraRecordingModes.md)

Defined in: [types/camera.ts:249](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L249)

Recording mode settings

***

### createdAt?

> `optional` **createdAt?**: `string`

Defined in: [types/camera.ts:251](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L251)

ISO 8601 timestamp when the camera was created

***

### updatedAt?

> `optional` **updatedAt?**: `string`

Defined in: [types/camera.ts:253](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L253)

ISO 8601 timestamp when the camera was last updated
