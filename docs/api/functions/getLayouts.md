[**EEN API Toolkit v0.3.96**](../README.md)

***

[EEN API Toolkit](../README.md) / getLayouts

# Function: getLayouts()

> **getLayouts**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Layout`](../interfaces/Layout.md)\>\>\>

Defined in: [layouts/service.ts:56](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/layouts/service.ts#L56)

List layouts with optional pagination and filtering.

## Parameters

### params?

[`ListLayoutsParams`](../interfaces/ListLayoutsParams.md)

Optional pagination and filtering parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Layout`](../interfaces/Layout.md)\>\>\>

A Result containing a paginated list of layouts or an error

## Remarks

Fetches a paginated list of layouts from `/api/v3.0/layouts`. Supports
filtering options for name, search, and more.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listlayouts).

## Example

```typescript
import { getLayouts } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getLayouts()
if (data) {
  console.log(`Found ${data.results.length} layouts`)
}

// With filters
const { data } = await getLayouts({
  pageSize: 50,
  include: ['resourceCounts', 'effectivePermissions']
})

// Fetch all layouts
let allLayouts: Layout[] = []
let pageToken: string | undefined
do {
  const { data, error } = await getLayouts({ pageSize: 100, pageToken })
  if (error) break
  allLayouts.push(...data.results)
  pageToken = data.nextPageToken
} while (pageToken)
```
