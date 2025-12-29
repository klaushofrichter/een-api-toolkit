[**EEN API Toolkit v0.0.13**](../README.md)

***

[EEN API Toolkit](../README.md) / PaginationParams

# Interface: PaginationParams

Defined in: [src/types/common.ts:105](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L105)

Pagination parameters for list operations.

## Remarks

Most list APIs in the EEN platform support pagination. Use `pageSize` to
control how many results are returned, and `pageToken` to fetch subsequent pages.

## Example

```typescript
// First page
const { data } = await getUsers({ pageSize: 50 })

// Next page (if available)
if (data.nextPageToken) {
  const { data: page2 } = await getUsers({
    pageSize: 50,
    pageToken: data.nextPageToken
  })
}
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [src/types/common.ts:107](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L107)

Number of results per page (default varies by endpoint, typically 100)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/common.ts:109](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L109)

Token for fetching a specific page (from previous response's nextPageToken)
