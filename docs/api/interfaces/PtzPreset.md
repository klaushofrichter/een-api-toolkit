[**EEN API Toolkit v0.3.89**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzPreset

# Interface: PtzPreset

Defined in: [types/ptz.ts:162](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L162)

A saved PTZ preset position.

## Remarks

Presets allow quick navigation to saved camera positions.

## Properties

### name

> **name**: `string`

Defined in: [types/ptz.ts:164](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L164)

Human-readable name for this preset

***

### position

> **position**: [`PtzPosition`](PtzPosition.md)

Defined in: [types/ptz.ts:166](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L166)

The saved position coordinates

***

### timeAtPreset

> **timeAtPreset**: `number`

Defined in: [types/ptz.ts:168](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L168)

Time the camera stays at this preset (in seconds) during tour mode
