[**EEN API Toolkit v0.1.8**](../README.md)

***

[EEN API Toolkit](../README.md) / ListFeedsResult

# Interface: ListFeedsResult

Defined in: [src/types/feeds.ts:196](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L196)

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

Defined in: [src/types/feeds.ts:198](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L198)

Array of feed objects

***

### nextPageToken?

> `optional` **nextPageToken**: `string`

Defined in: [src/types/feeds.ts:201](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L201)

Token for fetching next page (undefined if no more results)

***

### totalSize?

> `optional` **totalSize**: `number`

Defined in: [src/types/feeds.ts:204](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L204)

Total number of feeds available (may not always be provided)
