[**EEN API Toolkit v0.3.59**](../README.md)

***

[EEN API Toolkit](../README.md) / EventData

# Interface: EventData

Defined in: [src/types/event.ts:35](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L35)

Event data object within an event.

## Remarks

Event data is polymorphic - different event types have different data schemas.
The `type` field indicates the schema, and additional properties contain
the actual event data. Common schemas include:
- `een.objectDetection.v1` - Object detection results
- `een.fullFrameImageUrl.v1` - Full frame image URL
- `een.croppedFrameImageUrl.v1` - Cropped frame image URL

## Indexable

\[`key`: `string`\]: `unknown`

Additional properties vary by event type

## Properties

### type

> **type**: `string`

Defined in: [src/types/event.ts:37](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L37)

Data schema type (e.g., "een.objectDetection.v1")

***

### creatorId

> **creatorId**: `string`

Defined in: [src/types/event.ts:39](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L39)

ID of the entity that created this data
