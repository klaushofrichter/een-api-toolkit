[**EEN API Toolkit v0.3.42**](../README.md)

***

[EEN API Toolkit](../README.md) / getCameras

# Function: getCameras()

> **getCameras**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Camera`](../interfaces/Camera.md)\>\>\>

Defined in: [src/cameras/service.ts:49](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/cameras/service.ts#L49)

List cameras with optional pagination and filtering.

## Parameters

### params?

[`ListCamerasParams`](../interfaces/ListCamerasParams.md)

Optional pagination and filtering parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Camera`](../interfaces/Camera.md)\>\>\>

A Result containing a paginated list of cameras or an error

## Remarks

Fetches a paginated list of cameras from `/api/v3.0/cameras`. Supports
extensive filtering options for location, status, tags, and more.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listcameras).

## Example

```typescript
import { getCameras } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getCameras()
if (data) {
  console.log(`Found ${data.results.length} cameras`)
}

// With filters
const { data } = await getCameras({
  pageSize: 50,
  status__in: ['online'],
  include: ['deviceInfo', 'streamUrls']
})

// Fetch all cameras
let allCameras: Camera[] = []
let pageToken: string | undefined
do {
  const { data, error } = await getCameras({ pageSize: 100, pageToken })
  if (error) break
  allCameras.push(...data.results)
  pageToken = data.nextPageToken
} while (pageToken)
```
