[**EEN API Toolkit v0.3.100**](../README.md)

***

[EEN API Toolkit](../README.md) / EventSubscriptionConfig

# Interface: EventSubscriptionConfig

Defined in: [types/eventSubscription.ts:32](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L32)

Event subscription configuration.

## Remarks

Contains lifecycle and TTL settings for the subscription.
This is read-only and set by the server based on delivery type.

## Properties

### lifeCycle

> **lifeCycle**: [`EventSubscriptionLifecycle`](../type-aliases/EventSubscriptionLifecycle.md)

Defined in: [types/eventSubscription.ts:34](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L34)

Subscription lifecycle type

***

### timeToLiveSeconds?

> `optional` **timeToLiveSeconds**: `number`

Defined in: [types/eventSubscription.ts:36](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L36)

Time-to-live in seconds for temporary subscriptions
