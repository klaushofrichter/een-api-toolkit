[**EEN API Toolkit v0.3.55**](../README.md)

***

[EEN API Toolkit](../README.md) / listNotifications

# Function: listNotifications()

> **listNotifications**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Notification`](../interfaces/Notification.md)\>\>\>

Defined in: [src/notifications/service.ts:65](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/notifications/service.ts#L65)

List notifications with optional filters and pagination.

## Parameters

### params?

[`ListNotificationsParams`](../interfaces/ListNotificationsParams.md)

Optional filtering and pagination parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Notification`](../interfaces/Notification.md)\>\>\>

A Result containing a paginated list of notifications or an error

## Remarks

Fetches a paginated list of notifications from `/api/v3.0/notifications`. Supports
various filters including time range, actor, alert type, category, and more.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listnotifications).

## Example

```typescript
import { listNotifications } from 'een-api-toolkit'

// Get recent notifications for a specific camera
const { data, error } = await listNotifications({
  actorId: '100d4c41',
  timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
  pageSize: 50
})

if (data) {
  console.log(`Found ${data.results.length} notifications`)
  data.results.forEach(notification => {
    console.log(`${notification.category}: ${notification.description}`)
  })
}

// Get unread notifications
const { data: unread } = await listNotifications({
  read: false,
  category: 'video'
})

// Fetch all notifications with pagination
let allNotifications: Notification[] = []
let pageToken: string | undefined
do {
  const { data, error } = await listNotifications({
    timestamp__gte: new Date(Date.now() - 86400000).toISOString(),
    pageSize: 100,
    pageToken
  })
  if (error) break
  allNotifications.push(...data.results)
  pageToken = data.nextPageToken
} while (pageToken)
```
