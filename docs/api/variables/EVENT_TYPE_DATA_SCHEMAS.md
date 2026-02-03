[**EEN API Toolkit v0.3.54**](../README.md)

***

[EEN API Toolkit](../README.md) / EVENT\_TYPE\_DATA\_SCHEMAS

# Variable: EVENT\_TYPE\_DATA\_SCHEMAS

> `const` **EVENT\_TYPE\_DATA\_SCHEMAS**: `Readonly`\<`Record`\<[`KnownEventType`](../type-aliases/KnownEventType.md), readonly [`DataSchema`](../type-aliases/DataSchema.md)[]\>\>

Defined in: [src/events/dataSchemas.ts:213](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/dataSchemas.ts#L213)

Mapping of event types to their supported data schemas.

## Remarks

This is a complete mapping derived from the EEN API v3.0 specification.
When an event type has no associated data schemas, it maps to an empty array.

## Example

```typescript
import { EVENT_TYPE_DATA_SCHEMAS } from 'een-api-toolkit'

// Get schemas for a specific event type
const schemas = EVENT_TYPE_DATA_SCHEMAS['een.personDetectionEvent.v1']
// ['een.objectDetection.v1', 'een.personAttributes.v1', ...]
```
