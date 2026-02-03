[**EEN API Toolkit v0.3.50**](../README.md)

***

[EEN API Toolkit](../README.md) / EventSubscriptionDeliveryType

# Type Alias: EventSubscriptionDeliveryType

> **EventSubscriptionDeliveryType** = `"serverSentEvents.v1"` \| `"webhook.v1"`

Defined in: [src/types/eventSubscription.ts:21](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L21)

Delivery type for event subscriptions.

## Remarks

- `serverSentEvents.v1`: Connect via SSE to receive events in real-time
- `webhook.v1`: Events are pushed to a client-provided URL
