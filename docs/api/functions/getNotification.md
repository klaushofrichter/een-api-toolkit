[**EEN API Toolkit v0.3.85**](../README.md)

***

[EEN API Toolkit](../README.md) / getNotification

# Function: getNotification()

> **getNotification**(`notificationId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Notification`](../interfaces/Notification.md)\>\>

Defined in: [notifications/service.ts:195](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/notifications/service.ts#L195)

Get a specific notification by ID.

## Parameters

### notificationId

`string`

The unique identifier of the notification to fetch

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Notification`](../interfaces/Notification.md)\>\>

A Result containing the notification or an error

## Remarks

Fetches a single notification from `/api/v3.0/notifications/{notificationId}`.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getnotification).

## Example

```typescript
import { getNotification } from 'een-api-toolkit'

const { data, error } = await getNotification('notification-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Notification not found')
  }
  return
}

console.log(`Notification: ${data.category} - ${data.description}`)
console.log(`Read: ${data.read}`)
```
