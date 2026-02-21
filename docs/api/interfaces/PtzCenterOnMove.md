[**EEN API Toolkit v0.3.87**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzCenterOnMove

# Interface: PtzCenterOnMove

Defined in: [types/ptz.ts:121](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L121)

Center the camera on a point in the current frame.

## Remarks

Uses relative coordinates (0.0 to 1.0) within the current video frame
to center the camera on a specific point. Useful for click-to-center
functionality in video players.

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

Defined in: [types/ptz.ts:123](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L123)

Must be 'centerOn'

***

### relativeX

> **relativeX**: `number`

Defined in: [types/ptz.ts:125](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L125)

Horizontal position in frame (0.0 = left, 1.0 = right)

***

### relativeY

> **relativeY**: `number`

Defined in: [types/ptz.ts:127](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L127)

Vertical position in frame (0.0 = top, 1.0 = bottom)
