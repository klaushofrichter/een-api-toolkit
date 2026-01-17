[**EEN API Toolkit v0.3.15**](../README.md)

***

[EEN API Toolkit](../README.md) / listMedia

# Function: listMedia()

> **listMedia**(`params`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`MediaInterval`](../interfaces/MediaInterval.md)\>\>\>

Defined in: [src/media/service.ts:98](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/media/service.ts#L98)

List media intervals (recording periods) for a device.

## Parameters

### params

[`ListMediaParams`](../interfaces/ListMediaParams.md)

Required parameters including deviceId, type, mediaType, and startTimestamp

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`MediaInterval`](../interfaces/MediaInterval.md)\>\>\>

A Result containing a paginated list of media intervals or an error

## Remarks

Fetches a paginated list of time intervals for which recordings exist.
Use this to find available recordings for a camera.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listmedia).

## Example

```typescript
import { listMedia } from 'een-api-toolkit'

// Get video recordings from the last hour
const { data, error } = await listMedia({
  deviceId: 'camera-123',
  type: 'preview',
  mediaType: 'video',
  startTimestamp: new Date(Date.now() - 3600000).toISOString()
})

if (data) {
  console.log(`Found ${data.results.length} recording intervals`)
  data.results.forEach(interval => {
    console.log(`${interval.startTimestamp} - ${interval.endTimestamp}`)
  })
}
```
