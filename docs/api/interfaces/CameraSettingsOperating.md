[**EEN API Toolkit v0.3.73**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraSettingsOperating

# Interface: CameraSettingsOperating

Defined in: [types/camera.ts:546](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L546)

Camera operating settings.

## Remarks

Controls whether the camera is on or off, with optional scheduled overrides.

## Properties

### on?

> `optional` **on**: `boolean`

Defined in: [types/camera.ts:548](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L548)

Whether the camera is currently on

***

### scheduledOverride?

> `optional` **scheduledOverride**: [`CameraSettingsScheduledOverride`](CameraSettingsScheduledOverride.md) \| `null`

Defined in: [types/camera.ts:550](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L550)

Optional scheduled override for on/off state
