[**EEN API Toolkit v0.3.61**](../README.md)

***

[EEN API Toolkit](../README.md) / SSEEvent

# Interface: SSEEvent

Defined in: [src/types/eventSubscription.ts:347](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L347)

Event received via SSE.

## Remarks

This is the event payload delivered through the SSE connection.
The structure matches the Event type from the events API.

## Properties

### id

> **id**: `string`

Defined in: [src/types/eventSubscription.ts:349](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L349)

Unique identifier for the event

***

### startTimestamp

> **startTimestamp**: `string`

Defined in: [src/types/eventSubscription.ts:351](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L351)

ISO 8601 timestamp when the event started

***

### endTimestamp?

> `optional` **endTimestamp**: `string` \| `null`

Defined in: [src/types/eventSubscription.ts:353](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L353)

ISO 8601 timestamp when the event ended (null for point-in-time events)

***

### span?

> `optional` **span**: `boolean`

Defined in: [src/types/eventSubscription.ts:355](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L355)

Whether this is a span event (has duration) or point-in-time event

***

### accountId?

> `optional` **accountId**: `string`

Defined in: [src/types/eventSubscription.ts:357](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L357)

ID of the account this event belongs to

***

### actorId

> **actorId**: `string`

Defined in: [src/types/eventSubscription.ts:359](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L359)

ID of the actor (device/entity) that generated the event

***

### actorAccountId?

> `optional` **actorAccountId**: `string`

Defined in: [src/types/eventSubscription.ts:361](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L361)

Account ID of the actor

***

### actorType?

> `optional` **actorType**: `string`

Defined in: [src/types/eventSubscription.ts:363](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L363)

Type of actor that generated the event

***

### creatorId?

> `optional` **creatorId**: `string`

Defined in: [src/types/eventSubscription.ts:365](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L365)

ID of the entity that created the event

***

### type

> **type**: `string`

Defined in: [src/types/eventSubscription.ts:367](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L367)

Event type identifier (e.g., "een.motionDetectionEvent.v1")

***

### dataSchemas?

> `optional` **dataSchemas**: `string`[]

Defined in: [src/types/eventSubscription.ts:369](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L369)

List of data schema types included in this event

***

### data?

> `optional` **data**: `object`[]

Defined in: [src/types/eventSubscription.ts:371](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L371)

Event data objects (varies by event type)

#### Index Signature

\[`key`: `string`\]: `unknown`

#### type

> **type**: `string`

#### creatorId?

> `optional` **creatorId**: `string`
