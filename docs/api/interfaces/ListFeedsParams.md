[**EEN API Toolkit v0.3.78**](../README.md)

***

[EEN API Toolkit](../README.md) / ListFeedsParams

# Interface: ListFeedsParams

Defined in: [types/feeds.ts:166](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L166)

Parameters for listing feeds.

## Remarks

Use these parameters to filter and paginate feed results.
The `include` parameter controls which URL fields are returned.

## Example

```typescript
// Get all feeds for a specific camera with HLS and multipart URLs
const params: ListFeedsParams = {
  deviceId: '10058b7a',
  include: ['hlsUrl', 'multipartUrl']
}

// Get preview feeds for multiple cameras
const params: ListFeedsParams = {
  deviceId__in: ['10058b7a', '10058b7b'],
  type: 'preview'
}
```

## Properties

### deviceId?

> `optional` **deviceId**: `string`

Defined in: [types/feeds.ts:168](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L168)

Filter by single device ID

***

### deviceId\_\_in?

> `optional` **deviceId\_\_in**: `string`[]

Defined in: [types/feeds.ts:171](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L171)

Filter by multiple device IDs

***

### type?

> `optional` **type**: [`FeedStreamType`](../type-aliases/FeedStreamType.md)

Defined in: [types/feeds.ts:174](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L174)

Filter by stream type

***

### include?

> `optional` **include**: [`FeedIncludeOption`](../type-aliases/FeedIncludeOption.md)[]

Defined in: [types/feeds.ts:177](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L177)

URL fields to include in response

***

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [types/feeds.ts:180](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L180)

Number of results per page

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [types/feeds.ts:183](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L183)

Pagination cursor from previous response

***

### signal?

> `optional` **signal**: `AbortSignal`

Defined in: [types/feeds.ts:186](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L186)

AbortSignal for cancelling the request
