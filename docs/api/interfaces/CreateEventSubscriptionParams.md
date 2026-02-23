[**EEN API Toolkit v0.3.99**](../README.md)

***

[EEN API Toolkit](../README.md) / CreateEventSubscriptionParams

# Interface: CreateEventSubscriptionParams

Defined in: [types/eventSubscription.ts:250](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L250)

Parameters for creating an event subscription.

## Remarks

Creates a new subscription with the specified delivery type and filters.
For SSE subscriptions, use `connectToEventSubscription()` to start receiving events.

## Example

```typescript
import { createEventSubscription } from 'een-api-toolkit'

// Create an SSE subscription for motion events from a camera
const { data, error } = await createEventSubscription({
  deliveryConfig: { type: 'serverSentEvents.v1' },
  filters: [{
    actors: ['camera:100d4c41'],
    types: [{ id: 'een.motionDetectionEvent.v1' }]
  }]
})

if (data) {
  console.log(`Created subscription: ${data.id}`)
  // For SSE subscriptions, connect to the sseUrl
  if (data.deliveryConfig.type === 'serverSentEvents.v1') {
    console.log(`SSE URL: ${data.deliveryConfig.sseUrl}`)
  }
}
```

## Properties

### deliveryConfig

> **deliveryConfig**: [`DeliveryConfigCreate`](../type-aliases/DeliveryConfigCreate.md)

Defined in: [types/eventSubscription.ts:252](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L252)

Delivery configuration

***

### filters

> **filters**: [`FilterCreate`](FilterCreate.md)[]

Defined in: [types/eventSubscription.ts:254](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L254)

List of filters for the subscription
