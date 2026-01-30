[**EEN API Toolkit v0.3.45**](../README.md)

***

[EEN API Toolkit](../README.md) / Notification

# Interface: Notification

Defined in: [src/types/notification.ts:62](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L62)

Notification entity from EEN API v3.0.

## Remarks

Represents a notification in the Eagle Eye Networks platform. Notifications
are sent to users based on alerts and system events through various channels
like email, push notifications, etc.

For more details on notifications, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listnotifications).

## Example

```typescript
import { listNotifications, type Notification } from 'een-api-toolkit'

const { data, error } = await listNotifications({
  actorId: '100d4c41',
  timestamp__gte: new Date(Date.now() - 3600000).toISOString()
})
if (data) {
  data.results.forEach((notification: Notification) => {
    console.log(`${notification.category}: ${notification.description}`)
  })
}
```

## Properties

### id

> **id**: `string`

Defined in: [src/types/notification.ts:64](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L64)

Unique identifier for the notification

***

### timestamp

> **timestamp**: `string`

Defined in: [src/types/notification.ts:66](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L66)

ISO 8601 timestamp of the notification event

***

### createTimestamp

> **createTimestamp**: `string`

Defined in: [src/types/notification.ts:68](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L68)

ISO 8601 timestamp when the notification was created in the system

***

### sentTimestamp?

> `optional` **sentTimestamp**: `string`

Defined in: [src/types/notification.ts:70](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L70)

ISO 8601 timestamp when the notification was sent

***

### alertId?

> `optional` **alertId**: `string` \| `null`

Defined in: [src/types/notification.ts:72](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L72)

ID of the alert that triggered this notification (null if not alert-based)

***

### alertType?

> `optional` **alertType**: `string`

Defined in: [src/types/notification.ts:74](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L74)

Type of alert that triggered this notification

***

### actorId

> **actorId**: `string`

Defined in: [src/types/notification.ts:76](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L76)

ID of the actor (device/entity) associated with this notification

***

### actorName?

> `optional` **actorName**: `string`

Defined in: [src/types/notification.ts:78](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L78)

Human-readable name of the actor

***

### actorType

> **actorType**: `string`

Defined in: [src/types/notification.ts:80](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L80)

Type of actor associated with this notification

***

### actorAccountId

> **actorAccountId**: `string`

Defined in: [src/types/notification.ts:82](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L82)

Account ID of the actor

***

### userId

> **userId**: `string`

Defined in: [src/types/notification.ts:84](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L84)

ID of the user this notification was sent to

***

### accountId

> **accountId**: `string`

Defined in: [src/types/notification.ts:86](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L86)

ID of the account this notification belongs to

***

### read

> **read**: `boolean`

Defined in: [src/types/notification.ts:88](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L88)

Whether the notification has been read by the user

***

### status

> **status**: [`NotificationStatus`](../type-aliases/NotificationStatus.md)

Defined in: [src/types/notification.ts:90](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L90)

Current delivery status of the notification

***

### category

> **category**: [`NotificationCategory`](../type-aliases/NotificationCategory.md)

Defined in: [src/types/notification.ts:92](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L92)

Category of the notification

***

### description?

> `optional` **description**: `string`

Defined in: [src/types/notification.ts:94](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L94)

Human-readable description of the notification

***

### notificationActions

> **notificationActions**: `string`[]

Defined in: [src/types/notification.ts:96](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L96)

Actions that were taken for this notification

***

### dataSchemas

> **dataSchemas**: `string`[]

Defined in: [src/types/notification.ts:98](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L98)

List of data schema types included in this notification

***

### data

> **data**: `Record`\<`string`, `unknown`\>

Defined in: [src/types/notification.ts:100](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/notification.ts#L100)

Notification data objects (varies by notification type)
