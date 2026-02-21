[**EEN API Toolkit v0.3.86**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzPositionMove

# Interface: PtzPositionMove

Defined in: [types/ptz.ts:63](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L63)

Move to absolute PTZ coordinates.

## Remarks

Moves the camera to specific x, y, z position values.

## Example

```typescript
const move: PtzPositionMove = {
  moveType: 'position',
  x: 0.5,
  y: -0.3,
  z: 2.0
}
```

## Properties

### moveType

> **moveType**: `"position"`

Defined in: [types/ptz.ts:65](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L65)

Must be 'position'

***

### x?

> `optional` **x**: `number`

Defined in: [types/ptz.ts:67](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L67)

Target pan position

***

### y?

> `optional` **y**: `number`

Defined in: [types/ptz.ts:69](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L69)

Target tilt position

***

### z?

> `optional` **z**: `number`

Defined in: [types/ptz.ts:71](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L71)

Target zoom level
