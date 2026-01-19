[**EEN API Toolkit v0.3.17**](../README.md)

***

[EEN API Toolkit](../README.md) / deleteEventSubscription

# Function: deleteEventSubscription()

> **deleteEventSubscription**(`subscriptionId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

Defined in: [src/eventSubscriptions/service.ts:283](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/eventSubscriptions/service.ts#L283)

Delete an event subscription.

## Parameters

### subscriptionId

`string`

The unique identifier of the subscription to delete

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

A Result with void data on success or an error

## Remarks

Deletes an event subscription at `/api/v3.0/eventSubscriptions/{id}`.
Any active SSE connections to this subscription will be closed.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/deleteeventsubscription).

## Example

```typescript
import { deleteEventSubscription } from 'een-api-toolkit'

const { error } = await deleteEventSubscription('f3d6f55d5ba546168758a309508f4419')
if (error) {
  console.error('Failed to delete:', error.message)
} else {
  console.log('Subscription deleted successfully')
}
```
