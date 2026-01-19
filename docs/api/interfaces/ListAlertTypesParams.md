[**EEN API Toolkit v0.3.18**](../README.md)

***

[EEN API Toolkit](../README.md) / ListAlertTypesParams

# Interface: ListAlertTypesParams

Defined in: [src/types/alert.ts:278](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L278)

Parameters for listing alert types.

## Remarks

Supports pagination for listing all available alert types.

## Example

```typescript
import { listAlertTypes } from 'een-api-toolkit'

const { data } = await listAlertTypes({ pageSize: 50 })
if (data) {
  data.results.forEach(alertType => {
    console.log(`${alertType.type}: ${alertType.description}`)
  })
}
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [src/types/alert.ts:280](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L280)

Number of results per page

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/alert.ts:282](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L282)

Token for fetching a specific page
