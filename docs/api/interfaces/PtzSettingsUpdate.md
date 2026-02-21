[**EEN API Toolkit v0.3.89**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzSettingsUpdate

# Interface: PtzSettingsUpdate

Defined in: [types/ptz.ts:238](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L238)

Parameters for updating PTZ settings (all fields optional).

## Remarks

Used with `updatePtzSettings()` to partially update PTZ configuration.
Only provided fields are updated; omitted fields retain their current values.

## Example

```typescript
import { updatePtzSettings } from 'een-api-toolkit'

// Change mode only
await updatePtzSettings('camera-id', { mode: 'tour' })

// Update presets and home preset
await updatePtzSettings('camera-id', {
  presets: [{ name: 'Entrance', position: { x: 0, y: 0, z: 1 }, timeAtPreset: 10 }],
  homePreset: 'Entrance'
})
```

## Properties

### presets?

> `optional` **presets**: [`PtzPreset`](PtzPreset.md)[]

Defined in: [types/ptz.ts:240](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L240)

Updated array of preset positions

***

### homePreset?

> `optional` **homePreset**: `string` \| `null`

Defined in: [types/ptz.ts:242](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L242)

Updated home preset name

***

### mode?

> `optional` **mode**: [`PtzMode`](../type-aliases/PtzMode.md)

Defined in: [types/ptz.ts:244](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L244)

Updated automation mode

***

### autoStartDelay?

> `optional` **autoStartDelay**: `number`

Defined in: [types/ptz.ts:246](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L246)

Updated auto-start delay in seconds
