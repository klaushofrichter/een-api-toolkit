[**EEN API Toolkit v0.3.64**](../README.md)

***

[EEN API Toolkit](../README.md) / GetEventParams

# Interface: GetEventParams

Defined in: [src/types/event.ts:203](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L203)

Parameters for getting a single event by ID.

## Remarks

Supports including additional data schemas in the response.

## Example

```typescript
import { getEvent } from 'een-api-toolkit'

const { data } = await getEvent('event-123', {
  include: ['data.een.objectDetection.v1', 'data.een.fullFrameImageUrl.v1']
})
```

## Properties

### include?

> `optional` **include**: `string`[]

Defined in: [src/types/event.ts:205](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L205)

Data schemas to include in the response
