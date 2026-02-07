[**EEN API Toolkit v0.3.56**](../README.md)

***

[EEN API Toolkit](../README.md) / listFeeds

# Function: listFeeds()

> **listFeeds**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`ListFeedsResult`](../interfaces/ListFeedsResult.md)\>\>

Defined in: [src/feeds/service.ts:60](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/feeds/service.ts#L60)

List feeds with optional filtering and pagination.

## Parameters

### params?

[`ListFeedsParams`](../interfaces/ListFeedsParams.md)

Optional filtering and pagination parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`ListFeedsResult`](../interfaces/ListFeedsResult.md)\>\>

A Result containing a list of feeds or an error

## Remarks

Fetches a list of feeds from `/api/v3.0/feeds`. Feeds represent live or
recorded streams from devices (cameras, speakers). Use the `include` parameter
to request specific streaming URLs.

A single device can have multiple feeds (main, preview, talkdown) with
different quality levels and purposes.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listfeeds).

## Example

```typescript
import { listFeeds } from 'een-api-toolkit'
import type { Feed } from 'een-api-toolkit'

// Get all feeds
const { data, error } = await listFeeds()
if (data) {
  console.log(`Found ${data.results.length} feeds`)
}

// Get feeds for a specific camera with streaming URLs
const { data: cameraFeeds } = await listFeeds({
  deviceId: 'camera-123',
  include: ['hlsUrl', 'multipartUrl']
})

// Get preview feeds for multiple cameras
const { data: previewFeeds } = await listFeeds({
  deviceId__in: ['camera-1', 'camera-2'],
  type: 'preview',
  include: ['hlsUrl']
})

// Paginate through all feeds
let allFeeds: Feed[] = []
let pageToken: string | undefined
do {
  const { data, error } = await listFeeds({ pageSize: 100, pageToken })
  if (error) break
  allFeeds.push(...data.results)
  pageToken = data.nextPageToken
} while (pageToken)
```
