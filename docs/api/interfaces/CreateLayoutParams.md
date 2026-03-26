[**EEN API Toolkit v0.3.104**](../README.md)

***

[EEN API Toolkit](../README.md) / CreateLayoutParams

# Interface: CreateLayoutParams

Defined in: [types/layout.ts:319](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L319)

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

Defined in: [types/layout.ts:321](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L321)

Display name for the layout (required)

***

### settings

> **settings**: [`LayoutSettings`](LayoutSettings.md)

Defined in: [types/layout.ts:323](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L323)

Display settings for the layout (required)

***

### panes?

> `optional` **panes?**: [`LayoutPane`](LayoutPane.md)[]

Defined in: [types/layout.ts:325](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L325)

Initial panes to add to the layout (optional)
