[**EEN API Toolkit v0.3.86**](../README.md)

***

[EEN API Toolkit](../README.md) / getPtzSettings

# Function: getPtzSettings()

> **getPtzSettings**(`cameraId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PtzSettings`](../interfaces/PtzSettings.md)\>\>

Defined in: [ptz/service.ts:170](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/ptz/service.ts#L170)

Get PTZ settings for a camera, including presets and automation mode.

## Parameters

### cameraId

`string`

The unique identifier of the PTZ camera

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PtzSettings`](../interfaces/PtzSettings.md)\>\>

A Result containing the PTZ settings or an error

## Remarks

Fetches PTZ configuration from `/api/v3.0/cameras/{cameraId}/ptz/settings`.
Returns presets, home preset, automation mode, and auto-start delay.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getptzsettings).

## Example

```typescript
import { getPtzSettings } from 'een-api-toolkit'

const { data, error } = await getPtzSettings('camera-123')
if (data) {
  console.log('Mode:', data.mode)
  console.log('Presets:', data.presets.length)
  console.log('Home:', data.homePreset)
}
```
