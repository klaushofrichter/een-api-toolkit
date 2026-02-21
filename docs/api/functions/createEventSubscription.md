[**EEN API Toolkit v0.3.91**](../README.md)

***

[EEN API Toolkit](../README.md) / createEventSubscription

# Function: createEventSubscription()

> **createEventSubscription**(`params`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventSubscription`](../interfaces/EventSubscription.md)\>\>

Defined in: [eventSubscriptions/service.ts:199](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/eventSubscriptions/service.ts#L199)

Create a new event subscription.

## Parameters

### params

[`CreateEventSubscriptionParams`](../interfaces/CreateEventSubscriptionParams.md)

Parameters for creating the subscription

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventSubscription`](../interfaces/EventSubscription.md)\>\>

A Result containing the created event subscription or an error

## Remarks

Creates a new event subscription at `/api/v3.0/eventSubscriptions`.
For SSE subscriptions, use `connectToEventSubscription()` with the returned
`sseUrl` to start receiving events.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/createeventsubscription).

## Example

```typescript
import { createEventSubscription, connectToEventSubscription } from 'een-api-toolkit'

// Create an SSE subscription for motion events
const { data, error } = await createEventSubscription({
  deliveryConfig: { type: 'serverSentEvents.v1' },
  filters: [{
    actors: ['camera:100d4c41'],
    types: [{ id: 'een.motionDetectionEvent.v1' }]
  }]
})

if (data && data.deliveryConfig.type === 'serverSentEvents.v1') {
  // Connect to the SSE stream
  const { data: connection } = connectToEventSubscription(
    data.deliveryConfig.sseUrl!,
    { onEvent: (event) => console.log('Event:', event) }
  )
}
```
