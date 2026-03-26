[**EEN API Toolkit v0.3.105**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzCenterOnMove

# Interface: PtzCenterOnMove

Defined in: [types/ptz.ts:143](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L143)

Center the camera on a point in the current frame.

## Remarks

Uses relative coordinates within the current video frame
to center the camera on a specific point. Useful for click-to-center
functionality in video players.
Both `relativeX` and `relativeY` must be in the range 0.0 to 1.0,
where (0.0, 0.0) is the top-left corner and (1.0, 1.0) is the bottom-right.

## Example

```typescript
// Center on the middle-right area of the frame
const move: PtzCenterOnMove = {
  moveType: 'centerOn',
  relativeX: 0.75,
  relativeY: 0.5
}
```

## Properties

### moveType

> **moveType**: `"centerOn"`

Defined in: [types/ptz.ts:145](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L145)

Must be 'centerOn'

***

### relativeX

> **relativeX**: `number`

Defined in: [types/ptz.ts:147](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L147)

Horizontal position in frame (0.0 = left, 1.0 = right)

***

### relativeY

> **relativeY**: `number`

Defined in: [types/ptz.ts:149](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L149)

Vertical position in frame (0.0 = top, 1.0 = bottom)
