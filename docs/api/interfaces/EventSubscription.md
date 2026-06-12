[**EEN API Toolkit v0.3.107**](../README.md)

***

[EEN API Toolkit](../README.md) / EventSubscription

# Interface: EventSubscription

Defined in: [types/eventSubscription.ts:171](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L171)

Event subscription entity from EEN API v3.0.

## Remarks

Represents an event subscription in the Eagle Eye Networks platform.
Subscriptions allow receiving real-time events via SSE or webhooks.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listeventsubscriptions).

## Example

```typescript
import { listEventSubscriptions, type EventSubscription } from 'een-api-toolkit'

const { data, error } = await listEventSubscriptions()
if (data) {
  data.results.forEach((sub: EventSubscription) => {
    console.log(`Subscription ${sub.id}: ${sub.deliveryConfig.type}`)
    if (sub.deliveryConfig.type === 'serverSentEvents.v1') {
      console.log(`  SSE URL: ${sub.deliveryConfig.sseUrl}`)
    }
  })
}
```

## Properties

### id

> **id**: `string`

Defined in: [types/eventSubscription.ts:173](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L173)

Unique identifier for the subscription

***

### subscriptionConfig?

> `optional` **subscriptionConfig?**: [`EventSubscriptionConfig`](EventSubscriptionConfig.md)

Defined in: [types/eventSubscription.ts:175](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L175)

Subscription configuration (lifecycle, TTL)

***

### deliveryConfig

> **deliveryConfig**: [`DeliveryConfig`](../type-aliases/DeliveryConfig.md)

Defined in: [types/eventSubscription.ts:177](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L177)

Delivery configuration (SSE or webhook)
