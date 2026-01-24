[**EEN API Toolkit v0.3.31**](../README.md)

***

[EEN API Toolkit](../README.md) / CreateLayoutParams

# Interface: CreateLayoutParams

Defined in: [src/types/layout.ts:311](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L311)

Parameters for creating a new layout.

## Remarks

Name and settings are required. Panes can be added during creation
or later via update.

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
```

## Properties

### name

> **name**: `string`

Defined in: [src/types/layout.ts:313](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L313)

Display name for the layout (required)

***

### settings

> **settings**: [`LayoutSettings`](LayoutSettings.md)

Defined in: [src/types/layout.ts:315](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L315)

Display settings for the layout (required)

***

### panes?

> `optional` **panes**: [`LayoutPane`](LayoutPane.md)[]

Defined in: [src/types/layout.ts:317](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L317)

Initial panes to add to the layout (optional)
