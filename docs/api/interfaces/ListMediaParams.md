[**EEN API Toolkit v0.3.20**](../README.md)

***

[EEN API Toolkit](../README.md) / ListMediaParams

# Interface: ListMediaParams

Defined in: [src/types/media.ts:82](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L82)

Parameters for listing media intervals.

## Remarks

Used to query recording intervals for a device.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listmedia).

## Example

```typescript
import { listMedia } from 'een-api-toolkit'

// Get video recordings from the last hour
const { data } = await listMedia({
  deviceId: 'camera-123',
  type: 'preview',
  mediaType: 'video',
  startTimestamp: new Date(Date.now() - 3600000).toISOString()
})
```

## Properties

### deviceId

> **deviceId**: `string`

Defined in: [src/types/media.ts:84](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L84)

The ID of the device (camera) - required

***

### type

> **type**: [`MediaStreamType`](../type-aliases/MediaStreamType.md)

Defined in: [src/types/media.ts:86](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L86)

Stream type (preview or main) - required

***

### mediaType

> **mediaType**: [`MediaType`](../type-aliases/MediaType.md)

Defined in: [src/types/media.ts:88](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L88)

Media type (video or image) - required

***

### startTimestamp

> **startTimestamp**: `string`

Defined in: [src/types/media.ts:90](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L90)

Minimum timestamp from which to list recordings (ISO 8601) - required

***

### endTimestamp?

> `optional` **endTimestamp**: `string`

Defined in: [src/types/media.ts:92](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L92)

Maximum timestamp until which to list recordings (ISO 8601)

***

### coalesce?

> `optional` **coalesce**: `boolean`

Defined in: [src/types/media.ts:94](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L94)

If true, coalesce connected intervals into a single interval (default: true)

***

### include?

> `optional` **include**: `string`[]

Defined in: [src/types/media.ts:99](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L99)

Additional fields to include in the response.
Valid values: flvUrl, rtspUrl, rtspsUrl, hlsUrl, multipartUrl, mp4Url, wsLiveUrl

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/media.ts:101](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L101)

Token for fetching a specific page

***

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [src/types/media.ts:103](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L103)

Number of results per page
