[**EEN API Toolkit v0.3.94**](../README.md)

***

[EEN API Toolkit](../README.md) / SSEConnection

# Interface: SSEConnection

Defined in: [types/eventSubscription.ts:317](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L317)

SSE connection handle.

## Remarks

Returned by `connectToEventSubscription()`. Use `close()` to disconnect
and `status` to check the current connection state.

## Example

```typescript
const { data: connection } = connectToEventSubscription(sseUrl, {
  onEvent: (event) => console.log('Event:', event),
  onStatusChange: (status) => console.log('Status:', status)
})

// Later, disconnect
if (connection) {
  connection.close()
}
```

## Properties

### close()

> **close**: () => `void`

Defined in: [types/eventSubscription.ts:319](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L319)

Close the SSE connection

#### Returns

`void`

***

### status

> **status**: [`SSEConnectionStatus`](../type-aliases/SSEConnectionStatus.md)

Defined in: [types/eventSubscription.ts:321](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L321)

Current connection status
