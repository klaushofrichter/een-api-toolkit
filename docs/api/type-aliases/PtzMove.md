[**EEN API Toolkit v0.3.87**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzMove

# Type Alias: PtzMove

> **PtzMove** = [`PtzPositionMove`](../interfaces/PtzPositionMove.md) \| [`PtzDirectionMove`](../interfaces/PtzDirectionMove.md) \| [`PtzCenterOnMove`](../interfaces/PtzCenterOnMove.md)

Defined in: [types/ptz.ts:152](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L152)

Discriminated union of all PTZ move types.

## Remarks

Use the `moveType` field to discriminate between the three movement types.

## Example

```typescript
import { movePtz, type PtzMove } from 'een-api-toolkit'

// Position move
await movePtz('camera-id', { moveType: 'position', x: 0.5, y: 0.0, z: 1.0 })

// Direction move
await movePtz('camera-id', { moveType: 'direction', direction: ['left'], stepSize: 'small' })

// Center-on move
await movePtz('camera-id', { moveType: 'centerOn', relativeX: 0.5, relativeY: 0.5 })
```
