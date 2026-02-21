[**EEN API Toolkit v0.3.91**](../README.md)

***

[EEN API Toolkit](../README.md) / GetAlertParams

# Interface: GetAlertParams

Defined in: [types/alert.ts:253](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L253)

Parameters for getting a single alert by ID.

## Remarks

Supports including additional fields in the response.

## Example

```typescript
import { getAlert } from 'een-api-toolkit'

const { data } = await getAlert('alert-123', {
  include: ['data', 'actions', 'description']
})
```

## Properties

### include?

> `optional` **include**: [`AlertInclude`](../type-aliases/AlertInclude.md)[]

Defined in: [types/alert.ts:255](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L255)

Fields to include in response
