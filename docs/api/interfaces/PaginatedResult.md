[**EEN API Toolkit v0.3.73**](../README.md)

***

[EEN API Toolkit](../README.md) / PaginatedResult

# Interface: PaginatedResult\<T\>

Defined in: [types/common.ts:123](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L123)

Paginated response from list operations.

## Remarks

Contains the results array and optional pagination tokens for navigating
through large result sets.

## Type Parameters

### T

`T`

The type of items in the results array

## Properties

### results

> **results**: `T`[]

Defined in: [types/common.ts:125](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L125)

Array of items for this page

***

### nextPageToken?

> `optional` **nextPageToken**: `string`

Defined in: [types/common.ts:127](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L127)

Token to fetch the next page (undefined if no more pages)

***

### prevPageToken?

> `optional` **prevPageToken**: `string`

Defined in: [types/common.ts:129](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L129)

Token to fetch the previous page (undefined if on first page)

***

### totalSize?

> `optional` **totalSize**: `number`

Defined in: [types/common.ts:131](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L131)

Total number of items across all pages (may not be provided by all endpoints)
