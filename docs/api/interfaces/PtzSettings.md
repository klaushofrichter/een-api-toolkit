[**EEN API Toolkit v0.3.88**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzSettings

# Interface: PtzSettings

Defined in: [types/ptz.ts:204](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L204)

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

Defined in: [types/ptz.ts:206](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L206)

Array of saved preset positions

***

### homePreset

> **homePreset**: `string` \| `null`

Defined in: [types/ptz.ts:208](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L208)

Name of the home preset, or null if none is set

***

### mode

> **mode**: [`PtzMode`](../type-aliases/PtzMode.md)

Defined in: [types/ptz.ts:210](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L210)

Automation mode controlling automatic camera movement

***

### autoStartDelay

> **autoStartDelay**: `number`

Defined in: [types/ptz.ts:212](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L212)

Seconds of inactivity before automatic movement begins
