[**EEN API Toolkit v0.3.15**](../README.md)

***

[EEN API Toolkit](../README.md) / ListNotificationsParams

# Interface: ListNotificationsParams

Defined in: [src/types/notification.ts:143](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L143)

Parameters for listing notifications.

## Remarks

Supports filtering notifications by various criteria including time range,
actor, alert type, category, and more. Supports pagination and sorting.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listnotifications).

## Example

```typescript
import { listNotifications } from 'een-api-toolkit'

// Get recent notifications for a specific camera
const { data } = await listNotifications({
  actorId: '100d4c41',
  timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
  pageSize: 50,
  sort: ['-timestamp']
})

// Get unread notifications
const { data: unread } = await listNotifications({
  read: false,
  category: 'video'
})

// Fetch next page
if (data?.nextPageToken) {
  const { data: page2 } = await listNotifications({
    actorId: '100d4c41',
    timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
    pageToken: data.nextPageToken
  })
}
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [src/types/notification.ts:146](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L146)

Number of results per page (default: 100)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/notification.ts:148](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L148)

Token for fetching a specific page

***

### timestamp\_\_lte?

> `optional` **timestamp\_\_lte**: `string`

Defined in: [src/types/notification.ts:152](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L152)

ISO 8601 timestamp - notifications at or before this time

***

### timestamp\_\_gte?

> `optional` **timestamp\_\_gte**: `string`

Defined in: [src/types/notification.ts:154](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L154)

ISO 8601 timestamp - notifications at or after this time

***

### alertId?

> `optional` **alertId**: `string`

Defined in: [src/types/notification.ts:158](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L158)

Filter by alert ID

***

### alertType?

> `optional` **alertType**: `string`

Defined in: [src/types/notification.ts:160](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L160)

Filter by alert type

***

### actorId?

> `optional` **actorId**: `string`

Defined in: [src/types/notification.ts:162](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L162)

Filter by actor ID

***

### actorType?

> `optional` **actorType**: `string`

Defined in: [src/types/notification.ts:164](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L164)

Filter by actor type

***

### actorAccountId?

> `optional` **actorAccountId**: `string`

Defined in: [src/types/notification.ts:166](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L166)

Filter by actor account ID

***

### category?

> `optional` **category**: [`NotificationCategory`](../type-aliases/NotificationCategory.md)

Defined in: [src/types/notification.ts:170](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L170)

Filter by notification category

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/types/notification.ts:172](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L172)

Filter by user ID

***

### read?

> `optional` **read**: `boolean`

Defined in: [src/types/notification.ts:174](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L174)

Filter by read status

***

### status?

> `optional` **status**: [`NotificationStatus`](../type-aliases/NotificationStatus.md)

Defined in: [src/types/notification.ts:176](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L176)

Filter by delivery status

***

### includeV1Notifications?

> `optional` **includeV1Notifications**: `boolean`

Defined in: [src/types/notification.ts:180](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L180)

Include legacy v1 notifications

***

### sort?

> `optional` **sort**: (`"+timestamp"` \| `"-timestamp"`)[]

Defined in: [src/types/notification.ts:184](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L184)

Sort order for results

***

### language?

> `optional` **language**: `string`

Defined in: [src/types/notification.ts:186](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L186)

Language code for localized descriptions
