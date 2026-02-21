[**EEN API Toolkit v0.3.91**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraSettingsOperating

# Interface: CameraSettingsOperating

Defined in: [types/camera.ts:553](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L553)

Camera operating settings.

## Remarks

Controls whether the camera is on or off, with optional scheduled overrides.

## Properties

### on?

> `optional` **on**: `boolean`

Defined in: [types/camera.ts:555](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L555)

Whether the camera is currently on

***

### scheduledOverride?

> `optional` **scheduledOverride**: [`CameraSettingsScheduledOverride`](CameraSettingsScheduledOverride.md) \| `null`

Defined in: [types/camera.ts:557](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L557)

Optional scheduled override for on/off state
