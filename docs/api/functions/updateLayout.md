[**EEN API Toolkit v0.3.51**](../README.md)

***

[EEN API Toolkit](../README.md) / updateLayout

# Function: updateLayout()

> **updateLayout**(`layoutId`, `params`): `Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

Defined in: [src/layouts/service.ts:362](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/layouts/service.ts#L362)

Update an existing layout.

## Parameters

### layoutId

`string`

The unique identifier of the layout to update

### params

[`UpdateLayoutParams`](../interfaces/UpdateLayoutParams.md)

The fields to update

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

A Result containing void on success or an error

## Remarks

Updates a layout via `PATCH /api/v3.0/layouts/{layoutId}`. Only provided
fields will be updated. Returns void on success (204 No Content).

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/updatelayout).

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

if (error) {
  console.error('Update failed:', error.message)
}
```
