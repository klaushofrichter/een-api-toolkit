[**EEN API Toolkit v0.3.104**](../README.md)

***

[EEN API Toolkit](../README.md) / ListLayoutsParams

# Interface: ListLayoutsParams

Defined in: [types/layout.ts:223](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L223)

Parameters for listing layouts.

## Remarks

Supports extensive filtering options matching the EEN API v3.0.
All array parameters are sent as comma-separated values.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listlayouts).

## Example

```typescript
import { getLayouts } from 'een-api-toolkit'

// Get layouts with pagination
const { data } = await getLayouts({
  pageSize: 50,
  include: ['resourceCounts', 'effectivePermissions']
})

// Search layouts by name
const { data: searchResults } = await getLayouts({
  q: 'lobby',
  qRelevance__gte: 0.5
})

// Filter by name
const { data: filtered } = await getLayouts({
  name__contains: 'entrance'
})
```

## Properties

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [types/layout.ts:226](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L226)

Number of results per page (default: 100, max: 1000)

***

### pageToken?

> `optional` **pageToken?**: `string`

Defined in: [types/layout.ts:228](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L228)

Token for fetching a specific page

***

### include?

> `optional` **include?**: [`ListLayoutsInclude`](../type-aliases/ListLayoutsInclude.md)[]

Defined in: [types/layout.ts:232](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L232)

Additional fields to include in the response

***

### sort?

> `optional` **sort?**: [`ListLayoutsSort`](../type-aliases/ListLayoutsSort.md)[]

Defined in: [types/layout.ts:234](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L234)

Fields to sort by (prefix with - for descending, + for ascending)

***

### name?

> `optional` **name?**: `string`

Defined in: [types/layout.ts:238](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L238)

Filter by exact name

***

### name\_\_in?

> `optional` **name\_\_in?**: `string`[]

Defined in: [types/layout.ts:240](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L240)

Filter by names (any match)

***

### name\_\_contains?

> `optional` **name\_\_contains?**: `string`

Defined in: [types/layout.ts:242](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L242)

Filter by name containing substring (case-insensitive)

***

### id\_\_in?

> `optional` **id\_\_in?**: `string`[]

Defined in: [types/layout.ts:246](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L246)

Filter by layout IDs

***

### layoutPanes.cameras.bridgeId?

> `optional` **layoutPanes.cameras.bridgeId?**: `string`

Defined in: [types/layout.ts:250](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L250)

Filter by bridge ID of cameras in layout panes

***

### q?

> `optional` **q?**: `string`

Defined in: [types/layout.ts:254](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L254)

Full-text search query

***

### qRelevance\_\_gte?

> `optional` **qRelevance\_\_gte?**: `number`

Defined in: [types/layout.ts:256](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L256)

Minimum search relevance score (0.0 to 1.0)
