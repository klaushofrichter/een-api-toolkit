[**EEN API Toolkit v0.3.0**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraDeviceInfo

# Interface: CameraDeviceInfo

Defined in: [src/types/camera.ts:29](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L29)

Device information for a camera.

## Remarks

Contains hardware and firmware details about the physical camera device.

## Properties

### make?

> `optional` **make**: `string`

Defined in: [src/types/camera.ts:31](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L31)

Camera manufacturer (e.g., "Axis", "Hikvision")

***

### model?

> `optional` **model**: `string`

Defined in: [src/types/camera.ts:33](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L33)

Camera model

***

### firmwareVersion?

> `optional` **firmwareVersion**: `string`

Defined in: [src/types/camera.ts:35](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L35)

Firmware version

***

### directToCloud?

> `optional` **directToCloud**: `boolean`

Defined in: [src/types/camera.ts:37](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L37)

Whether camera connects directly to cloud (no bridge)

***

### serialNumber?

> `optional` **serialNumber**: `string`

Defined in: [src/types/camera.ts:39](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L39)

Serial number

***

### resolution?

> `optional` **resolution**: `string`

Defined in: [src/types/camera.ts:41](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L41)

Resolution capabilities

***

### type?

> `optional` **type**: `string`

Defined in: [src/types/camera.ts:43](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L43)

Camera type (e.g., "IP", "Analog")
