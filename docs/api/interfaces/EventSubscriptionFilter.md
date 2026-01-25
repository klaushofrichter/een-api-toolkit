[**EEN API Toolkit v0.3.39**](../README.md)

***

[EEN API Toolkit](../README.md) / EventSubscriptionFilter

# Interface: EventSubscriptionFilter

Defined in: [src/types/eventSubscription.ts:112](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L112)

Filter for event subscriptions.

## Remarks

A filter defines which events will be delivered. Events must match
all conditions within a filter to be delivered. The subscription
receives events matching any of its filters.

## Properties

### id

> **id**: `string`

Defined in: [src/types/eventSubscription.ts:114](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L114)

Unique filter ID within the subscription

***

### actors

> **actors**: `string`[]

Defined in: [src/types/eventSubscription.ts:116](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L116)

List of actors to filter (format: "type:id", e.g., "camera:100d4c41")

***

### types

> **types**: [`EventTypeFilter`](EventTypeFilter.md)[]

Defined in: [src/types/eventSubscription.ts:118](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L118)

List of event types to filter
