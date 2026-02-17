[**EEN API Toolkit v0.3.85**](../README.md)

***

[EEN API Toolkit](../README.md) / ListAlertsParams

# Interface: ListAlertsParams

Defined in: [types/alert.ts:176](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L176)

Parameters for listing alerts.

## Remarks

Supports filtering alerts by various criteria including time range, actor,
alert type, and more. Supports pagination and sorting.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listalerts).

## Example

```typescript
import { listAlerts } from 'een-api-toolkit'

// Get recent alerts from a specific camera
const { data } = await listAlerts({
  actorId__in: ['100d4c41'],
  timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
  pageSize: 50,
  include: ['data', 'actions'],
  sort: ['-timestamp']
})

// Fetch next page
if (data?.nextPageToken) {
  const { data: page2 } = await listAlerts({
    actorId__in: ['100d4c41'],
    timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
    pageToken: data.nextPageToken
  })
}
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [types/alert.ts:179](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L179)

Number of results per page (default: 100)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [types/alert.ts:181](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L181)

Token for fetching a specific page

***

### timestamp\_\_lte?

> `optional` **timestamp\_\_lte**: `string`

Defined in: [types/alert.ts:185](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L185)

ISO 8601 timestamp - alerts at or before this time

***

### timestamp\_\_gte?

> `optional` **timestamp\_\_gte**: `string`

Defined in: [types/alert.ts:187](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L187)

ISO 8601 timestamp - alerts at or after this time

***

### creatorId?

> `optional` **creatorId**: `string`

Defined in: [types/alert.ts:191](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L191)

Filter by creator ID

***

### alertType\_\_in?

> `optional` **alertType\_\_in**: `string`[]

Defined in: [types/alert.ts:193](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L193)

Filter by alert types (e.g., ["een.motionDetectionAlert.v1"])

***

### actorId\_\_in?

> `optional` **actorId\_\_in**: `string`[]

Defined in: [types/alert.ts:195](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L195)

Filter by actor IDs

***

### actorType\_\_in?

> `optional` **actorType\_\_in**: `string`[]

Defined in: [types/alert.ts:197](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L197)

Filter by actor types

***

### actorAccountId?

> `optional` **actorAccountId**: `string`

Defined in: [types/alert.ts:199](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L199)

Filter by actor account ID

***

### ruleId?

> `optional` **ruleId**: `string`

Defined in: [types/alert.ts:203](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L203)

Filter by rule ID

***

### ruleId\_\_in?

> `optional` **ruleId\_\_in**: `string`[]

Defined in: [types/alert.ts:205](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L205)

Filter by rule IDs

***

### eventId?

> `optional` **eventId**: `string`

Defined in: [types/alert.ts:209](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L209)

Filter by event ID

***

### locationId\_\_in?

> `optional` **locationId\_\_in**: `string`[]

Defined in: [types/alert.ts:211](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L211)

Filter by location IDs

***

### priority\_\_gte?

> `optional` **priority\_\_gte**: `number`

Defined in: [types/alert.ts:215](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L215)

Minimum priority level (inclusive)

***

### priority\_\_lte?

> `optional` **priority\_\_lte**: `number`

Defined in: [types/alert.ts:217](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L217)

Maximum priority level (inclusive)

***

### showInvalidAlerts?

> `optional` **showInvalidAlerts**: `boolean`

Defined in: [types/alert.ts:221](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L221)

Include alerts that are invalid

***

### alertActionId\_\_in?

> `optional` **alertActionId\_\_in**: `string`[]

Defined in: [types/alert.ts:223](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L223)

Filter by alert action IDs

***

### alertActionStatus\_\_in?

> `optional` **alertActionStatus\_\_in**: [`AlertActionStatus`](../type-aliases/AlertActionStatus.md)[]

Defined in: [types/alert.ts:225](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L225)

Filter by alert action statuses

***

### include?

> `optional` **include**: [`AlertInclude`](../type-aliases/AlertInclude.md)[]

Defined in: [types/alert.ts:229](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L229)

Fields to include in response

***

### sort?

> `optional` **sort**: [`AlertSort`](../type-aliases/AlertSort.md)[]

Defined in: [types/alert.ts:231](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L231)

Sort order for results

***

### language?

> `optional` **language**: `string`

Defined in: [types/alert.ts:233](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L233)

Language code for localized descriptions
