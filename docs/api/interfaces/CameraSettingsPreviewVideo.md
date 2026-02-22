[**EEN API Toolkit v0.3.93**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraSettingsPreviewVideo

# Interface: CameraSettingsPreviewVideo

Defined in: [types/camera.ts:477](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L477)

Camera preview video settings.

## Remarks

Configuration for the lower-resolution preview stream.

## Properties

### transmitMode?

> `optional` **transmitMode**: `string`

Defined in: [types/camera.ts:479](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L479)

Transmit mode (e.g., "always", "event")

***

### resolution?

> `optional` **resolution**: `string`

Defined in: [types/camera.ts:481](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L481)

Resolution of the preview stream

***

### intervalMs?

> `optional` **intervalMs**: `number`

Defined in: [types/camera.ts:483](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L483)

Interval between preview frames in milliseconds

***

### quality?

> `optional` **quality**: `string`

Defined in: [types/camera.ts:485](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L485)

Quality setting for preview stream

***

### supportedResolutions?

> `optional` **supportedResolutions**: `string`[]

Defined in: [types/camera.ts:487](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L487)

List of supported resolutions
