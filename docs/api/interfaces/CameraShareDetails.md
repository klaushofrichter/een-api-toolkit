[**EEN API Toolkit v0.3.98**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraShareDetails

# Interface: CameraShareDetails

Defined in: [types/camera.ts:54](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L54)

Share details for shared cameras.

## Remarks

Contains information about camera sharing between accounts.

## Properties

### shared?

> `optional` **shared**: `boolean`

Defined in: [types/camera.ts:56](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L56)

Whether the camera is shared

***

### accountId?

> `optional` **accountId**: `string`

Defined in: [types/camera.ts:58](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L58)

Account ID of the sharing account

***

### firstResponder?

> `optional` **firstResponder**: `boolean`

Defined in: [types/camera.ts:60](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L60)

Whether shared for first responder access

***

### permissions?

> `optional` **permissions**: `string`[]

Defined in: [types/camera.ts:62](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L62)

Permissions granted to the share recipient
