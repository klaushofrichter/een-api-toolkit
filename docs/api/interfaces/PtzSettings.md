[**EEN API Toolkit v0.3.90**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzSettings

# Interface: PtzSettings

Defined in: [types/ptz.ts:223](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L223)

PTZ camera settings including presets and automation mode.

## Remarks

Contains the full PTZ configuration for a camera: saved presets,
the designated home preset, automation mode, and auto-start delay.

## Example

```typescript
import { getPtzSettings } from 'een-api-toolkit'

const { data, error } = await getPtzSettings('camera-id')
if (data) {
  console.log('Mode:', data.mode)
  console.log('Presets:', data.presets.map(p => p.name))
  console.log('Home preset:', data.homePreset)
}
```

## Properties

### presets

> **presets**: [`PtzPreset`](PtzPreset.md)[]

Defined in: [types/ptz.ts:225](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L225)

Array of saved preset positions

***

### homePreset

> **homePreset**: `string` \| `null`

Defined in: [types/ptz.ts:227](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L227)

Name of the home preset, or null if none is set

***

### mode

> **mode**: [`PtzMode`](../type-aliases/PtzMode.md)

Defined in: [types/ptz.ts:229](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L229)

Automation mode controlling automatic camera movement

***

### autoStartDelay

> **autoStartDelay**: `number`

Defined in: [types/ptz.ts:231](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L231)

Seconds of inactivity before automatic movement begins
