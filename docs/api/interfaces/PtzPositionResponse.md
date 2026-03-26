[**EEN API Toolkit v0.3.105**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzPositionResponse

# Interface: PtzPositionResponse

Defined in: [types/ptz.ts:29](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L29)

PTZ position as returned by the API (all fields present).

## Remarks

When reading the current camera position via `getPtzPosition()`, the API
always returns all three coordinates. This type extends `PtzPosition` with
required fields for type safety at response sites.

## Properties

### x

> **x**: `number`

Defined in: [types/ptz.ts:31](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L31)

Pan position (horizontal rotation)

***

### y

> **y**: `number`

Defined in: [types/ptz.ts:33](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L33)

Tilt position (vertical rotation)

***

### z

> **z**: `number`

Defined in: [types/ptz.ts:35](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L35)

Zoom level
