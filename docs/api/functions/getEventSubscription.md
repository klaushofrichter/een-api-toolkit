[**EEN API Toolkit v0.3.18**](../README.md)

***

[EEN API Toolkit](../README.md) / getEventSubscription

# Function: getEventSubscription()

> **getEventSubscription**(`subscriptionId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventSubscription`](../interfaces/EventSubscription.md)\>\>

Defined in: [src/eventSubscriptions/service.ts:118](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/eventSubscriptions/service.ts#L118)

Get a specific event subscription by ID.

## Parameters

### subscriptionId

`string`

The unique identifier of the subscription to fetch

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventSubscription`](../interfaces/EventSubscription.md)\>\>

A Result containing the event subscription or an error

## Remarks

Fetches a single event subscription from `/api/v3.0/eventSubscriptions/{id}`.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/geteventsubscription).

## Example

```typescript
import { getEventSubscription } from 'een-api-toolkit'

const { data, error } = await getEventSubscription('f3d6f55d5ba546168758a309508f4419')
if (data) {
  console.log(`Subscription: ${data.id}`)
  if (data.deliveryConfig.type === 'serverSentEvents.v1') {
    console.log(`SSE URL: ${data.deliveryConfig.sseUrl}`)
  }
}
```
