[**EEN API Toolkit v0.3.79**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraRtspConnectionSettings

# Interface: CameraRtspConnectionSettings

Defined in: [types/camera.ts:92](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L92)

RTSP connection settings for RTSP-based cameras.

## Remarks

Configuration for cameras that connect via RTSP protocol.

## Properties

### url?

> `optional` **url**: `string`

Defined in: [types/camera.ts:94](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L94)

RTSP URL for the camera stream

***

### username?

> `optional` **username**: `string`

Defined in: [types/camera.ts:96](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L96)

Username for RTSP authentication

***

### password?

> `optional` **password**: `string`

Defined in: [types/camera.ts:98](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L98)

Password for RTSP authentication (write-only, not returned in responses)

***

### transport?

> `optional` **transport**: `"tcp"` \| `"udp"`

Defined in: [types/camera.ts:100](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L100)

Transport protocol (tcp, udp)
