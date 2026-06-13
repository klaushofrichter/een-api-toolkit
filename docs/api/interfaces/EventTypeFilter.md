[**EEN API Toolkit v0.3.110**](../README.md)

***

[EEN API Toolkit](../README.md) / EventTypeFilter

# Interface: EventTypeFilter

Defined in: [types/eventSubscription.ts:97](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L97)

Event type filter for subscriptions.

## Remarks

Specifies which event types should trigger the subscription.
Use `listEventTypes()` to get available event type IDs.

## Example

```typescript
const typeFilter: EventTypeFilter = {
  id: 'een.motionDetectionEvent.v1'
}
```

## Properties

### id

> **id**: `string`

Defined in: [types/eventSubscription.ts:99](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L99)

Event type identifier (e.g., "een.motionDetectionEvent.v1")
