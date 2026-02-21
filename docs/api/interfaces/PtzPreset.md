[**EEN API Toolkit v0.3.90**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzPreset

# Interface: PtzPreset

Defined in: [types/ptz.ts:181](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L181)

A saved PTZ preset position.

## Remarks

Presets allow quick navigation to saved camera positions.

## Properties

### name

> **name**: `string`

Defined in: [types/ptz.ts:183](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L183)

Human-readable name for this preset

***

### position

> **position**: [`PtzPosition`](PtzPosition.md)

Defined in: [types/ptz.ts:185](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L185)

The saved position coordinates

***

### timeAtPreset

> **timeAtPreset**: `number`

Defined in: [types/ptz.ts:187](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L187)

Time the camera stays at this preset (in seconds) during tour mode
