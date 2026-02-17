[**EEN API Toolkit v0.3.83**](../README.md)

***

[EEN API Toolkit](../README.md) / Alert

# Interface: Alert

Defined in: [types/alert.ts:51](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L51)

Alert entity from EEN API v3.0.

## Remarks

Represents an alert in the Eagle Eye Networks platform. Alerts are generated
when events match configured rules and can trigger various actions like
notifications.

For more details on alerts, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listalerts).

## Example

```typescript
import { listAlerts, type Alert } from 'een-api-toolkit'

const { data, error } = await listAlerts({
  actorId__in: ['100d4c41'],
  timestamp__gte: new Date(Date.now() - 3600000).toISOString()
})
if (data) {
  data.results.forEach((alert: Alert) => {
    console.log(`${alert.alertType} at ${alert.timestamp}`)
  })
}
```

## Properties

### id

> **id**: `string`

Defined in: [types/alert.ts:53](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L53)

Unique identifier for the alert

***

### timestamp

> **timestamp**: `string`

Defined in: [types/alert.ts:55](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L55)

ISO 8601 timestamp when the alert was triggered

***

### createTimestamp

> **createTimestamp**: `string`

Defined in: [types/alert.ts:57](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L57)

ISO 8601 timestamp when the alert was created in the system

***

### creatorId

> **creatorId**: `string`

Defined in: [types/alert.ts:59](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L59)

ID of the entity that created the alert

***

### alertType

> **alertType**: `string`

Defined in: [types/alert.ts:61](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L61)

Type of alert (e.g., "een.motionDetectionAlert.v1")

***

### alertName?

> `optional` **alertName**: `string`

Defined in: [types/alert.ts:63](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L63)

Human-readable name of the alert

***

### category?

> `optional` **category**: `string`

Defined in: [types/alert.ts:65](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L65)

Category of the alert

***

### serviceRuleId?

> `optional` **serviceRuleId**: `string`

Defined in: [types/alert.ts:67](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L67)

ID of the service rule that triggered this alert

***

### eventType?

> `optional` **eventType**: `string`

Defined in: [types/alert.ts:69](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L69)

Event type that triggered this alert

***

### actorId

> **actorId**: `string`

Defined in: [types/alert.ts:71](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L71)

ID of the actor (device/entity) that generated the alert

***

### actorType

> **actorType**: `string`

Defined in: [types/alert.ts:73](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L73)

Type of actor that generated the alert

***

### actorAccountId

> **actorAccountId**: `string`

Defined in: [types/alert.ts:75](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L75)

Account ID of the actor

***

### actorName?

> `optional` **actorName**: `string`

Defined in: [types/alert.ts:77](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L77)

Human-readable name of the actor

***

### ruleId?

> `optional` **ruleId**: `string`

Defined in: [types/alert.ts:79](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L79)

ID of the rule that triggered this alert

***

### eventId?

> `optional` **eventId**: `string`

Defined in: [types/alert.ts:81](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L81)

ID of the event that triggered this alert

***

### locationId?

> `optional` **locationId**: `string`

Defined in: [types/alert.ts:83](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L83)

ID of the location associated with this alert

***

### locationName?

> `optional` **locationName**: `string`

Defined in: [types/alert.ts:85](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L85)

Human-readable name of the location

***

### priority?

> `optional` **priority**: `number`

Defined in: [types/alert.ts:87](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L87)

Priority level (0-20, where higher is more important)

***

### dataSchemas?

> `optional` **dataSchemas**: `string`[]

Defined in: [types/alert.ts:89](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L89)

List of data schema types included in this alert

***

### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

Defined in: [types/alert.ts:91](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L91)

Alert data objects (varies by alert type)

***

### actions?

> `optional` **actions**: `Record`\<`string`, [`AlertAction`](AlertAction.md)\>

Defined in: [types/alert.ts:93](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L93)

Actions executed for this alert

***

### description?

> `optional` **description**: `string`

Defined in: [types/alert.ts:95](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L95)

Human-readable description of the alert
