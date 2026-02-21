[**EEN API Toolkit v0.3.89**](../README.md)

***

[EEN API Toolkit](../README.md) / Event

# Interface: Event

Defined in: [types/event.ts:73](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L73)

Event entity from EEN API v3.0.

## Remarks

Represents an event in the Eagle Eye Networks platform. Events are generated
by various actors (cameras, bridges, etc.) and can include data like motion
detection, object detection, and more.

For more details on events, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listevents).

## Example

```typescript
import { listEvents, type Event } from 'een-api-toolkit'

const { data, error } = await listEvents({
  actor: 'camera:100d4c41',
  type__in: ['een.motionDetectionEvent.v1'],
  startTimestamp__gte: new Date(Date.now() - 3600000).toISOString()
})
if (data) {
  data.results.forEach((event: Event) => {
    console.log(`${event.type} at ${event.startTimestamp}`)
  })
}
```

## Properties

### id

> **id**: `string`

Defined in: [types/event.ts:75](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L75)

Unique identifier for the event

***

### startTimestamp

> **startTimestamp**: `string`

Defined in: [types/event.ts:77](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L77)

ISO 8601 timestamp when the event started

***

### endTimestamp?

> `optional` **endTimestamp**: `string` \| `null`

Defined in: [types/event.ts:79](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L79)

ISO 8601 timestamp when the event ended (null for point-in-time events)

***

### span

> **span**: `boolean`

Defined in: [types/event.ts:81](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L81)

Whether this is a span event (has duration) or point-in-time event

***

### accountId

> **accountId**: `string`

Defined in: [types/event.ts:83](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L83)

ID of the account this event belongs to

***

### actorId

> **actorId**: `string`

Defined in: [types/event.ts:85](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L85)

ID of the actor (device/entity) that generated the event

***

### actorAccountId

> **actorAccountId**: `string`

Defined in: [types/event.ts:87](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L87)

Account ID of the actor

***

### actorType

> **actorType**: [`ActorType`](../type-aliases/ActorType.md)

Defined in: [types/event.ts:89](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L89)

Type of actor that generated the event

***

### creatorId

> **creatorId**: `string`

Defined in: [types/event.ts:91](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L91)

ID of the entity that created the event

***

### type

> **type**: `string`

Defined in: [types/event.ts:93](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L93)

Event type identifier (e.g., "een.motionDetectionEvent.v1")

***

### dataSchemas

> **dataSchemas**: `string`[]

Defined in: [types/event.ts:95](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L95)

List of data schema types included in this event

***

### data

> **data**: [`EventData`](EventData.md)[]

Defined in: [types/event.ts:97](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L97)

Event data objects (varies by event type)
