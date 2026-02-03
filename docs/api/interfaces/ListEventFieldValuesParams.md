[**EEN API Toolkit v0.3.51**](../README.md)

***

[EEN API Toolkit](../README.md) / ListEventFieldValuesParams

# Interface: ListEventFieldValuesParams

Defined in: [src/types/event.ts:256](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L256)

Parameters for listing available event field values.

## Remarks

Used to discover what event types are available for a specific actor.
This is useful for building filter UIs.

## Example

```typescript
import { listEventFieldValues } from 'een-api-toolkit'

const { data } = await listEventFieldValues({ actor: 'camera:100d4c41' })
if (data) {
  console.log('Available event types:', data.type)
}
```

## Properties

### actor

> **actor**: `string`

Defined in: [src/types/event.ts:258](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L258)

Actor to get field values for (format: "type:id", e.g., "camera:100d4c41")
