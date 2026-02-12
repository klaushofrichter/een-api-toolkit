[**EEN API Toolkit v0.3.73**](../README.md)

***

[EEN API Toolkit](../README.md) / createLayout

# Function: createLayout()

> **createLayout**(`params`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Layout`](../interfaces/Layout.md)\>\>

Defined in: [layouts/service.ts:262](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/layouts/service.ts#L262)

Create a new layout.

## Parameters

### params

[`CreateLayoutParams`](../interfaces/CreateLayoutParams.md)

The layout configuration

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Layout`](../interfaces/Layout.md)\>\>

A Result containing the created layout or an error

## Remarks

Creates a layout via `POST /api/v3.0/layouts`. Name and settings are required.
Panes can be added during creation or later via `updateLayout()`.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/createlayout).

## Example

```typescript
import { createLayout } from 'een-api-toolkit'

const { data, error } = await createLayout({
  name: 'Main Lobby View',
  settings: {
    showCameraBorder: true,
    showCameraName: true,
    cameraAspectRatio: '16x9',
    paneColumns: 3
  },
  panes: [
    { id: 1, name: 'Entrance', type: 'preview', size: 1, cameraId: 'cam-123' },
    { id: 2, name: 'Lobby', type: 'preview', size: 2, cameraId: 'cam-456' }
  ]
})

if (data) {
  console.log(`Created layout: ${data.id}`)
}
```
