[**EEN API Toolkit v0.3.103**](../README.md)

***

[EEN API Toolkit](../README.md) / updatePtzSettings

# Function: updatePtzSettings()

> **updatePtzSettings**(`cameraId`, `settings`): `Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

Defined in: [ptz/service.ts:242](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/ptz/service.ts#L242)

Update PTZ settings for a camera (partial update).

## Parameters

### cameraId

`string`

The unique identifier of the PTZ camera

### settings

[`PtzSettingsUpdate`](../interfaces/PtzSettingsUpdate.md)

The settings fields to update

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

A Result containing void on success or an error

## Remarks

Updates PTZ configuration via `PATCH /api/v3.0/cameras/{cameraId}/ptz/settings`.
Only provided fields are updated; omitted fields retain their current values.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/updateptzsettings).

## Example

```typescript
import { updatePtzSettings } from 'een-api-toolkit'

// Change mode to tour
await updatePtzSettings('camera-123', { mode: 'tour' })

// Add a preset and set it as home
await updatePtzSettings('camera-123', {
  presets: [
    { name: 'Entrance', position: { x: 0, y: 0, z: 1 }, timeAtPreset: 10 }
  ],
  homePreset: 'Entrance'
})
```
