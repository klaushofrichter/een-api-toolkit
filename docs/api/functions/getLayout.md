[**EEN API Toolkit v0.3.99**](../README.md)

***

[EEN API Toolkit](../README.md) / getLayout

# Function: getLayout()

> **getLayout**(`layoutId`, `params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Layout`](../interfaces/Layout.md)\>\>

Defined in: [layouts/service.ts:177](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/layouts/service.ts#L177)

Get a specific layout by ID.

## Parameters

### layoutId

`string`

The unique identifier of the layout to fetch

### params?

[`GetLayoutParams`](../interfaces/GetLayoutParams.md)

Optional parameters (e.g., include additional fields)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Layout`](../interfaces/Layout.md)\>\>

A Result containing the layout or an error

## Remarks

Fetches a single layout from `/api/v3.0/layouts/{layoutId}`. Use the `include`
parameter to request additional fields.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getlayout).

## Example

```typescript
import { getLayout } from 'een-api-toolkit'

const { data, error } = await getLayout('layout-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Layout not found')
  }
  return
}

console.log(`Layout: ${data.name} (${data.panes.length} panes)`)

// With additional fields
const { data: layoutWithDetails } = await getLayout('layout-123', {
  include: ['effectivePermissions', 'resourceStatusCounts']
})
```
