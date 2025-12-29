[**EEN API Toolkit v0.0.14**](../README.md)

***

[EEN API Toolkit](../README.md) / PaginatedResult

# Interface: PaginatedResult\<T\>

Defined in: [src/types/common.ts:122](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L122)

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

Defined in: [src/types/common.ts:124](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L124)

Array of items for this page

***

### nextPageToken?

> `optional` **nextPageToken**: `string`

Defined in: [src/types/common.ts:126](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L126)

Token to fetch the next page (undefined if no more pages)

***

### prevPageToken?

> `optional` **prevPageToken**: `string`

Defined in: [src/types/common.ts:128](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L128)

Token to fetch the previous page (undefined if on first page)

***

### totalSize?

> `optional` **totalSize**: `number`

Defined in: [src/types/common.ts:130](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L130)

Total number of items across all pages (may not be provided by all endpoints)
