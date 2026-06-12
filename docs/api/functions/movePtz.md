[**EEN API Toolkit v0.3.107**](../README.md)

***

[EEN API Toolkit](../README.md) / movePtz

# Function: movePtz()

> **movePtz**(`cameraId`, `move`): `Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

Defined in: [ptz/service.ts:93](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/ptz/service.ts#L93)

Move a PTZ camera to a new position.

## Parameters

### cameraId

`string`

The unique identifier of the PTZ camera

### move

[`PtzMove`](../type-aliases/PtzMove.md)

The movement command (position, direction, or centerOn)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

A Result containing void on success or an error

## Remarks

Sends a movement command to a PTZ camera via
`PUT /api/v3.0/cameras/{cameraId}/ptz/position`.
Supports three move types: absolute position, relative direction, and center-on.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/updateptzposition).

## Example

```typescript
import { movePtz } from 'een-api-toolkit'

// Move to absolute position
await movePtz('camera-123', { moveType: 'position', x: 0.5, y: -0.3, z: 2.0 })

// Move in a direction
await movePtz('camera-123', { moveType: 'direction', direction: ['left'], stepSize: 'medium' })

// Center on a point in the frame
await movePtz('camera-123', { moveType: 'centerOn', relativeX: 0.75, relativeY: 0.5 })
```
