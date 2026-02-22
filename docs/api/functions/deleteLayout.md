[**EEN API Toolkit v0.3.93**](../README.md)

***

[EEN API Toolkit](../README.md) / deleteLayout

# Function: deleteLayout()

> **deleteLayout**(`layoutId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

Defined in: [layouts/service.ts:451](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/layouts/service.ts#L451)

Delete a layout.

## Parameters

### layoutId

`string`

The unique identifier of the layout to delete

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

A Result containing void on success or an error

## Remarks

Deletes a layout via `DELETE /api/v3.0/layouts/{layoutId}`.
Returns void on success (204 No Content).

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/deletelayout).

## Example

```typescript
import { deleteLayout } from 'een-api-toolkit'

const { error } = await deleteLayout('layout-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Layout already deleted')
  } else {
    console.error('Delete failed:', error.message)
  }
} else {
  console.log('Layout deleted successfully')
}
```
