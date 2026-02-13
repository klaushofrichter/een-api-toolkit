[**EEN API Toolkit v0.3.78**](../README.md)

***

[EEN API Toolkit](../README.md) / listEventSubscriptions

# Function: listEventSubscriptions()

> **listEventSubscriptions**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`EventSubscription`](../interfaces/EventSubscription.md)\>\>\>

Defined in: [eventSubscriptions/service.ts:44](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/eventSubscriptions/service.ts#L44)

List all event subscriptions for the current account.

## Parameters

### params?

[`ListEventSubscriptionsParams`](../interfaces/ListEventSubscriptionsParams.md)

Optional pagination parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`EventSubscription`](../interfaces/EventSubscription.md)\>\>\>

A Result containing a paginated list of event subscriptions or an error

## Remarks

Fetches a paginated list of event subscriptions from `/api/v3.0/eventSubscriptions`.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listeventsubscriptions).

## Example

```typescript
import { listEventSubscriptions } from 'een-api-toolkit'

const { data, error } = await listEventSubscriptions()
if (data) {
  console.log(`Found ${data.results.length} subscriptions`)
  data.results.forEach(sub => {
    console.log(`${sub.id}: ${sub.deliveryConfig.type}`)
  })
}
```
