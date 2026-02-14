[**EEN API Toolkit v0.3.79**](../README.md)

***

[EEN API Toolkit](../README.md) / connectToEventSubscription

# Function: connectToEventSubscription()

> **connectToEventSubscription**(`sseUrl`, `options`): [`Result`](../type-aliases/Result.md)\<[`SSEConnection`](../interfaces/SSEConnection.md)\>

Defined in: [eventSubscriptions/service.ts:379](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/eventSubscriptions/service.ts#L379)

Connect to an SSE event subscription to receive real-time events.

## Parameters

### sseUrl

`string`

The SSE URL from the event subscription's deliveryConfig

### options

[`SSEConnectionOptions`](../interfaces/SSEConnectionOptions.md)

Connection options including event and error callbacks

## Returns

[`Result`](../type-aliases/Result.md)\<[`SSEConnection`](../interfaces/SSEConnection.md)\>

A Result containing the SSE connection handle or an error

## Remarks

Opens an SSE connection to the provided URL and calls the `onEvent` callback
for each event received. The connection automatically handles reconnection
on errors.

Note: SSE connections require authentication. The token is passed via the
`Authorization` header. Since EventSource doesn't support custom headers,
we use fetch with ReadableStream to implement SSE.

## Example

```typescript
import { createEventSubscription, connectToEventSubscription } from 'een-api-toolkit'

// First create a subscription
const { data: subscription } = await createEventSubscription({
  deliveryConfig: { type: 'serverSentEvents.v1' },
  filters: [{
    actors: ['camera:100d4c41'],
    types: [{ id: 'een.motionDetectionEvent.v1' }]
  }]
})

if (subscription?.deliveryConfig.type === 'serverSentEvents.v1') {
  // Connect to SSE stream
  const { data: connection, error } = connectToEventSubscription(
    subscription.deliveryConfig.sseUrl!,
    {
      onEvent: (event) => {
        console.log(`Event: ${event.type} from ${event.actorId}`)
      },
      onError: (err) => {
        console.error('SSE error:', err.message)
      },
      onStatusChange: (status) => {
        console.log('Connection status:', status)
      }
    }
  )

  // Later, disconnect
  if (connection) {
    connection.close()
  }
}
```
