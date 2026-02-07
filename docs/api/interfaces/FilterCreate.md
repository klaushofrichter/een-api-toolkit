[**EEN API Toolkit v0.3.61**](../README.md)

***

[EEN API Toolkit](../README.md) / FilterCreate

# Interface: FilterCreate

Defined in: [src/types/eventSubscription.ts:137](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L137)

Filter creation parameters.

## Remarks

Used when creating filters inline with a subscription.

## Example

```typescript
const filter: FilterCreate = {
  actors: ['camera:100d4c41'],
  types: [{ id: 'een.motionDetectionEvent.v1' }]
}
```

## Properties

### actors

> **actors**: `string`[]

Defined in: [src/types/eventSubscription.ts:139](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L139)

List of actors to filter (format: "type:id", e.g., "camera:100d4c41")

***

### types

> **types**: [`EventTypeFilter`](EventTypeFilter.md)[]

Defined in: [src/types/eventSubscription.ts:141](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L141)

List of event types to filter
