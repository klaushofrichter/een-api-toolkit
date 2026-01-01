[**EEN API Toolkit v0.1.9**](../README.md)

***

[EEN API Toolkit](../README.md) / ListFeedsParams

# Interface: ListFeedsParams

Defined in: [src/types/feeds.ts:155](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L155)

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

Defined in: [src/types/feeds.ts:157](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L157)

Filter by single device ID

***

### deviceId\_\_in?

> `optional` **deviceId\_\_in**: `string`[]

Defined in: [src/types/feeds.ts:160](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L160)

Filter by multiple device IDs

***

### type?

> `optional` **type**: [`FeedStreamType`](../type-aliases/FeedStreamType.md)

Defined in: [src/types/feeds.ts:163](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L163)

Filter by stream type

***

### include?

> `optional` **include**: [`FeedIncludeOption`](../type-aliases/FeedIncludeOption.md)[]

Defined in: [src/types/feeds.ts:166](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L166)

URL fields to include in response

***

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [src/types/feeds.ts:169](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L169)

Number of results per page

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/feeds.ts:172](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L172)

Pagination cursor from previous response
