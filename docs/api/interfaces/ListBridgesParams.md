[**EEN API Toolkit v0.1.3**](../README.md)

***

[EEN API Toolkit](../README.md) / ListBridgesParams

# Interface: ListBridgesParams

Defined in: [src/types/bridge.ts:172](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L172)

Parameters for listing bridges.

## Remarks

Supports filtering options matching the EEN API v3.0.
All array parameters are sent as comma-separated values.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listbridges).

## Example

```typescript
import { getBridges } from 'een-api-toolkit'

// Get online bridges with pagination
const { data } = await getBridges({
  pageSize: 50,
  status__in: ['online'],
  include: ['deviceInfo', 'networkInfo']
})

// Filter by location
const { data: filtered } = await getBridges({
  locationId__in: ['loc-123']
})
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [src/types/bridge.ts:175](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L175)

Number of results per page (default: 100, max: 1000)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/bridge.ts:177](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L177)

Token for fetching a specific page

***

### include?

> `optional` **include**: `string`[]

Defined in: [src/types/bridge.ts:181](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L181)

Additional fields to include in the response

***

### sort?

> `optional` **sort**: `string`[]

Defined in: [src/types/bridge.ts:183](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L183)

Fields to sort by (prefix with - for descending)

***

### locationId\_\_in?

> `optional` **locationId\_\_in**: `string`[]

Defined in: [src/types/bridge.ts:187](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L187)

Filter by location IDs

***

### tags\_\_contains?

> `optional` **tags\_\_contains**: `string`[]

Defined in: [src/types/bridge.ts:191](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L191)

Filter by tags (all tags must be present)

***

### tags\_\_any?

> `optional` **tags\_\_any**: `string`[]

Defined in: [src/types/bridge.ts:193](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L193)

Filter by tags (any tag must be present)

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/bridge.ts:197](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L197)

Filter by exact name

***

### name\_\_contains?

> `optional` **name\_\_contains**: `string`

Defined in: [src/types/bridge.ts:199](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L199)

Filter by name containing substring (case-insensitive)

***

### name\_\_in?

> `optional` **name\_\_in**: `string`[]

Defined in: [src/types/bridge.ts:201](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L201)

Filter by exact names (any match)

***

### id\_\_in?

> `optional` **id\_\_in**: `string`[]

Defined in: [src/types/bridge.ts:205](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L205)

Filter by bridge IDs

***

### id\_\_notIn?

> `optional` **id\_\_notIn**: `string`[]

Defined in: [src/types/bridge.ts:207](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L207)

Exclude bridge IDs

***

### id\_\_contains?

> `optional` **id\_\_contains**: `string`

Defined in: [src/types/bridge.ts:209](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L209)

Filter by ID containing substring

***

### q?

> `optional` **q**: `string`

Defined in: [src/types/bridge.ts:213](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L213)

Full-text search query

***

### qRelevance\_\_gte?

> `optional` **qRelevance\_\_gte**: `number`

Defined in: [src/types/bridge.ts:215](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L215)

Minimum search relevance score

***

### status\_\_in?

> `optional` **status\_\_in**: [`BridgeStatus`](../type-aliases/BridgeStatus.md)[]

Defined in: [src/types/bridge.ts:219](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L219)

Filter by status values (any match)

***

### status\_\_ne?

> `optional` **status\_\_ne**: [`BridgeStatus`](../type-aliases/BridgeStatus.md)

Defined in: [src/types/bridge.ts:221](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L221)

Filter by status not equal to
