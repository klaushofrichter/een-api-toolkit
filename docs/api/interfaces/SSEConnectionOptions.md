[**EEN API Toolkit v0.3.49**](../README.md)

***

[EEN API Toolkit](../README.md) / SSEConnectionOptions

# Interface: SSEConnectionOptions

Defined in: [src/types/eventSubscription.ts:329](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L329)

Options for connecting to an SSE event subscription.

## Properties

### onEvent()

> **onEvent**: (`event`) => `void`

Defined in: [src/types/eventSubscription.ts:331](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L331)

Callback when an event is received

#### Parameters

##### event

[`SSEEvent`](SSEEvent.md)

#### Returns

`void`

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [src/types/eventSubscription.ts:333](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L333)

Callback when an error occurs

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onStatusChange()?

> `optional` **onStatusChange**: (`status`) => `void`

Defined in: [src/types/eventSubscription.ts:335](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L335)

Callback when connection status changes

#### Parameters

##### status

[`SSEConnectionStatus`](../type-aliases/SSEConnectionStatus.md)

#### Returns

`void`
