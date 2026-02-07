[**EEN API Toolkit v0.3.62**](../README.md)

***

[EEN API Toolkit](../README.md) / GetLayoutParams

# Interface: GetLayoutParams

Defined in: [src/types/layout.ts:286](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L286)

Parameters for getting a single layout.

## Remarks

Controls which additional fields to include in the response.

## Example

```typescript
import { getLayout } from 'een-api-toolkit'

const { data } = await getLayout('layout-123', {
  include: ['effectivePermissions', 'resourceStatusCounts']
})
```

## Properties

### include?

> `optional` **include**: [`GetLayoutInclude`](../type-aliases/GetLayoutInclude.md)[]

Defined in: [src/types/layout.ts:288](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L288)

Additional fields to include in the response
