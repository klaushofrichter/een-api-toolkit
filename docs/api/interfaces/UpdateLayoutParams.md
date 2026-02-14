[**EEN API Toolkit v0.3.79**](../README.md)

***

[EEN API Toolkit](../README.md) / UpdateLayoutParams

# Interface: UpdateLayoutParams

Defined in: [types/layout.ts:362](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L362)

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

Defined in: [types/layout.ts:364](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L364)

New display name for the layout

***

### settings?

> `optional` **settings**: `Partial`\<[`LayoutSettings`](LayoutSettings.md)\>

Defined in: [types/layout.ts:376](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L376)

Updated display settings.

#### Remarks

The EEN API supports partial PATCH updates for settings. You only need to
include the fields you want to change; other fields retain their current values.

#### Example

```ts
// Only update paneColumns, keeping other settings unchanged
{ settings: { paneColumns: 4 } }
```

***

### panes?

> `optional` **panes**: [`LayoutPane`](LayoutPane.md)[]

Defined in: [types/layout.ts:378](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L378)

New panes array (replaces existing panes entirely)
