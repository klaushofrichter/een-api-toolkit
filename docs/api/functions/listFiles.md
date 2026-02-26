[**EEN API Toolkit v0.3.102**](../README.md)

***

[EEN API Toolkit](../README.md) / listFiles

# Function: listFiles()

> **listFiles**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`EenFile`](../interfaces/EenFile.md)\>\>\>

Defined in: [files/service.ts:43](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/files/service.ts#L43)

List files with optional pagination and filtering.

## Parameters

### params?

[`ListFilesParams`](../interfaces/ListFilesParams.md)

Optional pagination and filtering parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`EenFile`](../interfaces/EenFile.md)\>\>\>

A Result containing a paginated list of files or an error

## Remarks

Fetches a paginated list of files from `/api/v3.0/files`. Supports
filtering by type, camera, and time range.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listfiles).

## Example

```typescript
import { listFiles } from 'een-api-toolkit'

// Basic usage
const { data, error } = await listFiles()
if (data) {
  console.log(`Found ${data.results.length} files`)
}

// Filter by type
const { data } = await listFiles({
  type__in: ['export'],
  pageSize: 50
})

// Files for a specific camera
const { data: cameraFiles } = await listFiles({
  cameraId: 'camera-123'
})
```
