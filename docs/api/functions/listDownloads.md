[**EEN API Toolkit v0.3.61**](../README.md)

***

[EEN API Toolkit](../README.md) / listDownloads

# Function: listDownloads()

> **listDownloads**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Download`](../interfaces/Download.md)\>\>\>

Defined in: [src/downloads/service.ts:38](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/downloads/service.ts#L38)

List downloads with optional pagination and filtering.

## Parameters

### params?

[`ListDownloadsParams`](../interfaces/ListDownloadsParams.md)

Optional pagination and filtering parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Download`](../interfaces/Download.md)\>\>\>

A Result containing a paginated list of downloads or an error

## Remarks

Fetches a paginated list of downloads from `/api/v3.0/downloads`. Supports
filtering by status, camera, and time range.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listdownloads).

## Example

```typescript
import { listDownloads } from 'een-api-toolkit'

// Basic usage
const { data, error } = await listDownloads()
if (data) {
  console.log(`Found ${data.results.length} downloads`)
}

// Filter by status
const { data } = await listDownloads({
  status__in: ['available'],
  pageSize: 50
})
```
