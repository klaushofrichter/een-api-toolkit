[**EEN API Toolkit v0.0.13**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraDeviceInfo

# Interface: CameraDeviceInfo

Defined in: src/types/camera.ts:29

Device information for a camera.

## Remarks

Contains hardware and firmware details about the physical camera device.

## Properties

### make?

> `optional` **make**: `string`

Defined in: src/types/camera.ts:31

Camera manufacturer (e.g., "Axis", "Hikvision")

***

### model?

> `optional` **model**: `string`

Defined in: src/types/camera.ts:33

Camera model

***

### firmwareVersion?

> `optional` **firmwareVersion**: `string`

Defined in: src/types/camera.ts:35

Firmware version

***

### directToCloud?

> `optional` **directToCloud**: `boolean`

Defined in: src/types/camera.ts:37

Whether camera connects directly to cloud (no bridge)

***

### serialNumber?

> `optional` **serialNumber**: `string`

Defined in: src/types/camera.ts:39

Serial number

***

### resolution?

> `optional` **resolution**: `string`

Defined in: src/types/camera.ts:41

Resolution capabilities

***

### type?

> `optional` **type**: `string`

Defined in: src/types/camera.ts:43

Camera type (e.g., "IP", "Analog")
