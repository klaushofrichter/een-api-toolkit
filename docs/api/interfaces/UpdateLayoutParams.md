[**EEN API Toolkit v0.3.32**](../README.md)

***

[EEN API Toolkit](../README.md) / UpdateLayoutParams

# Interface: UpdateLayoutParams

Defined in: [src/types/layout.ts:354](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L354)

Parameters for updating an existing layout.

## Remarks

All fields are optional. Only provided fields will be updated.
For settings, you can provide partial updates.

## Example

```typescript
import { updateLayout } from 'een-api-toolkit'

// Update name only
const { error } = await updateLayout('layout-123', {
  name: 'Updated Layout Name'
})

// Update settings
const { error } = await updateLayout('layout-123', {
  settings: {
    paneColumns: 4,
    showCameraName: false
  }
})

// Replace panes
const { error } = await updateLayout('layout-123', {
  panes: [
    { id: 1, name: 'New Pane', type: 'preview', size: 1, cameraId: 'cam-789' }
  ]
})
```

## Properties

### name?

> `optional` **name**: `string`

Defined in: [src/types/layout.ts:356](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L356)

New display name for the layout

***

### settings?

> `optional` **settings**: `Partial`\<[`LayoutSettings`](LayoutSettings.md)\>

Defined in: [src/types/layout.ts:358](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L358)

Updated display settings (partial update supported)

***

### panes?

> `optional` **panes**: [`LayoutPane`](LayoutPane.md)[]

Defined in: [src/types/layout.ts:360](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L360)

New panes array (replaces existing panes)
