[**EEN API Toolkit v0.3.110**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzPositionMove

# Interface: PtzPositionMove

Defined in: [types/ptz.ts:83](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L83)

Move to absolute PTZ coordinates.

## Remarks

Moves the camera to specific x, y, z position values.
At least one coordinate (x, y, or z) should be provided for a meaningful move.

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

Defined in: [types/ptz.ts:85](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L85)

Must be 'position'

***

### x?

> `optional` **x?**: `number`

Defined in: [types/ptz.ts:87](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L87)

Target pan position

***

### y?

> `optional` **y?**: `number`

Defined in: [types/ptz.ts:89](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L89)

Target tilt position

***

### z?

> `optional` **z?**: `number`

Defined in: [types/ptz.ts:91](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L91)

Target zoom level
