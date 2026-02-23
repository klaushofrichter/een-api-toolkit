[**EEN API Toolkit v0.3.98**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraSettingsPreviewVideo

# Interface: CameraSettingsPreviewVideo

Defined in: [types/camera.ts:489](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L489)

Camera preview video settings.

## Remarks

Configuration for the lower-resolution preview stream.

## Properties

### transmitMode?

> `optional` **transmitMode**: `string`

Defined in: [types/camera.ts:491](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L491)

Transmit mode (e.g., "always", "event")

***

### resolution?

> `optional` **resolution**: `string`

Defined in: [types/camera.ts:493](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L493)

Resolution of the preview stream

***

### intervalMs?

> `optional` **intervalMs**: `number`

Defined in: [types/camera.ts:495](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L495)

Interval between preview frames in milliseconds

***

### quality?

> `optional` **quality**: `string`

Defined in: [types/camera.ts:497](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L497)

Quality setting for preview stream

***

### supportedResolutions?

> `optional` **supportedResolutions**: `string`[]

Defined in: [types/camera.ts:499](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L499)

List of supported resolutions
