[**EEN API Toolkit v0.3.90**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzPositionMove

# Interface: PtzPositionMove

Defined in: [types/ptz.ts:82](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L82)

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

Defined in: [types/ptz.ts:84](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L84)

Must be 'position'

***

### x?

> `optional` **x**: `number`

Defined in: [types/ptz.ts:86](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L86)

Target pan position

***

### y?

> `optional` **y**: `number`

Defined in: [types/ptz.ts:88](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L88)

Target tilt position

***

### z?

> `optional` **z**: `number`

Defined in: [types/ptz.ts:90](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L90)

Target zoom level
