[**EEN API Toolkit v0.3.98**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzPreset

# Interface: PtzPreset

Defined in: [types/ptz.ts:184](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L184)

A saved PTZ preset position.

## Remarks

Presets allow quick navigation to saved camera positions.

## Properties

### name

> **name**: `string`

Defined in: [types/ptz.ts:186](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L186)

Human-readable name for this preset

***

### position

> **position**: [`PtzPositionResponse`](PtzPositionResponse.md)

Defined in: [types/ptz.ts:188](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L188)

The saved position coordinates (always has x, y, z from the API)

***

### timeAtPreset

> **timeAtPreset**: `number`

Defined in: [types/ptz.ts:190](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L190)

Time the camera stays at this preset (in seconds) during tour mode
