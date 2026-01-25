[**EEN API Toolkit v0.3.40**](../README.md)

***

[EEN API Toolkit](../README.md) / ListEventTypesParams

# Interface: ListEventTypesParams

Defined in: [src/types/event.ts:228](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L228)

Parameters for listing event types.

## Remarks

Supports pagination and language localization.

## Example

```typescript
import { listEventTypes } from 'een-api-toolkit'

const { data } = await listEventTypes({ language: 'en' })
if (data) {
  data.results.forEach(eventType => {
    console.log(`${eventType.name}: ${eventType.description}`)
  })
}
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [src/types/event.ts:230](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L230)

Number of results per page

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/event.ts:232](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L232)

Token for fetching a specific page

***

### language?

> `optional` **language**: `string`

Defined in: [src/types/event.ts:234](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L234)

Language code for localized names/descriptions (e.g., "en", "de")
