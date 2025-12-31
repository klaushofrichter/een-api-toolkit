[**EEN API Toolkit v0.1.7**](../README.md)

***

[EEN API Toolkit](../README.md) / getBridges

# Function: getBridges()

> **getBridges**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Bridge`](../interfaces/Bridge.md)\>\>\>

Defined in: [src/bridges/service.ts:49](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/bridges/service.ts#L49)

List bridges with optional pagination and filtering.

## Parameters

### params?

[`ListBridgesParams`](../interfaces/ListBridgesParams.md)

Optional pagination and filtering parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Bridge`](../interfaces/Bridge.md)\>\>\>

A Result containing a paginated list of bridges or an error

## Remarks

Fetches a paginated list of bridges from `/api/v3.0/bridges`. Supports
filtering options for location, status, tags, and more.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listbridges).

## Example

```typescript
import { getBridges } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getBridges()
if (data) {
  console.log(`Found ${data.results.length} bridges`)
}

// With filters
const { data } = await getBridges({
  pageSize: 50,
  status__in: ['online'],
  include: ['deviceInfo', 'networkInfo']
})

// Fetch all bridges
let allBridges: Bridge[] = []
let pageToken: string | undefined
do {
  const { data, error } = await getBridges({ pageSize: 100, pageToken })
  if (error) break
  allBridges.push(...data.results)
  pageToken = data.nextPageToken
} while (pageToken)
```
