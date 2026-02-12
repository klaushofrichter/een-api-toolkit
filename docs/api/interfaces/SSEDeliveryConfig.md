[**EEN API Toolkit v0.3.76**](../README.md)

***

[EEN API Toolkit](../README.md) / SSEDeliveryConfig

# Interface: SSEDeliveryConfig

Defined in: [types/eventSubscription.ts:48](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L48)

SSE delivery configuration.

## Remarks

Configuration for Server-Sent Events delivery type.
The `sseUrl` is provided by the server after subscription creation.

## Properties

### type

> **type**: `"serverSentEvents.v1"`

Defined in: [types/eventSubscription.ts:50](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L50)

Delivery type identifier

***

### sseUrl?

> `optional` **sseUrl**: `string`

Defined in: [types/eventSubscription.ts:52](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L52)

URL to connect for receiving SSE events (read-only, provided by server)
