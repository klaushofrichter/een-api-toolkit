[**EEN API Toolkit v0.3.86**](../README.md)

***

[EEN API Toolkit](../README.md) / ListFeedsResult

# Interface: ListFeedsResult

Defined in: [types/feeds.ts:210](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L210)

Result from listing feeds.

## Remarks

Contains the paginated list of feeds and pagination metadata.
Use `nextPageToken` with subsequent requests to fetch more results.

## Example

```typescript
const result: ListFeedsResult = {
  results: [
    { id: '10058b7a-main', type: 'main', deviceId: '10058b7a', mediaType: 'video' },
    { id: '10058b7a-preview', type: 'preview', deviceId: '10058b7a', mediaType: 'video' }
  ],
  nextPageToken: 'abc123',
  totalSize: 50
}
```

## Properties

### results

> **results**: [`Feed`](Feed.md)[]

Defined in: [types/feeds.ts:212](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L212)

Array of feed objects

***

### nextPageToken?

> `optional` **nextPageToken**: `string`

Defined in: [types/feeds.ts:215](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L215)

Token for fetching next page (undefined if no more results)

***

### totalSize?

> `optional` **totalSize**: `number`

Defined in: [types/feeds.ts:218](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L218)

Total number of feeds available (may not always be provided)
