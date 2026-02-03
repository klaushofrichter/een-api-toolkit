# Event Type to Data Schemas Mapping - EEN API Toolkit

> **Version:** 0.3.54
>
> Complete reference for event type to data schema mappings.
> Load this document when building dynamic event queries with the `include` parameter.

---

## Overview

When fetching events using the `listEvents` API, you can request additional event-specific data by using the `include` parameter. Each event type supports a specific set of data schemas. The toolkit provides a static mapping and utility functions to help you build the correct `include` parameter dynamically.

### Key Concept

- **Schema names** appear in the event's `dataSchemas` array (e.g., `een.objectDetection.v1`)
- **Include values** require the `data.` prefix (e.g., `data.een.objectDetection.v1`)

---

## Exported Functions

### getIncludeParameterForEventTypes(eventTypes)

Get the include parameter values for multiple event types. Combines all schemas, removes duplicates, and adds the `data.` prefix.

```typescript
import { getIncludeParameterForEventTypes, listEvents } from 'een-api-toolkit'

const selectedTypes = ['een.personDetectionEvent.v1', 'een.vehicleDetectionEvent.v1']
const includeValues = getIncludeParameterForEventTypes(selectedTypes)
// ['data.een.objectDetection.v1', 'data.een.personAttributes.v1', ...]

const result = await listEvents({
  actor: `camera:${cameraId}`,
  type__in: selectedTypes,
  startTimestamp__gte: startTime,
  include: includeValues
})
```

### getDataSchemasForEventType(eventType)

Get the data schemas for a specific event type (without `data.` prefix).

```typescript
import { getDataSchemasForEventType } from 'een-api-toolkit'

const schemas = getDataSchemasForEventType('een.personDetectionEvent.v1')
// ['een.objectDetection.v1', 'een.personAttributes.v1', ...]
```

### eventTypeHasDataSchemas(eventType)

Check if an event type has any associated data schemas.

```typescript
import { eventTypeHasDataSchemas } from 'een-api-toolkit'

if (eventTypeHasDataSchemas('een.personDetectionEvent.v1')) {
  // Include data schemas in the API call
}
```

### getEventTypesForDataSchema(schema)

Find which event types support a specific data schema.

```typescript
import { getEventTypesForDataSchema } from 'een-api-toolkit'

const eventTypes = getEventTypesForDataSchema('een.objectDetection.v1')
// ['een.motionDetectionEvent.v1', 'een.personDetectionEvent.v1', ...]
```

### getAllDataSchemas()

Get all unique data schemas across all event types.

```typescript
import { getAllDataSchemas } from 'een-api-toolkit'

const allSchemas = getAllDataSchemas()
// ['een.objectDetection.v1', 'een.fullFrameImageUrl.v1', ...]
```

### getAllKnownEventTypes()

Get all known event types defined in the mapping.

```typescript
import { getAllKnownEventTypes } from 'een-api-toolkit'

const allTypes = getAllKnownEventTypes()
// ['een.motionDetectionEvent.v1', 'een.personDetectionEvent.v1', ...]
```

---

## Static Mapping

The `EVENT_TYPE_DATA_SCHEMAS` constant provides the complete mapping:

```typescript
import { EVENT_TYPE_DATA_SCHEMAS } from 'een-api-toolkit'

const schemas = EVENT_TYPE_DATA_SCHEMAS['een.personDetectionEvent.v1']
// ['een.objectDetection.v1', 'een.personAttributes.v1', ...]
```

---

## Event Type to Data Schemas Reference

### Detection Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.motionDetectionEvent.v1` | `objectDetection`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `displayOverlay.boundingBox`, `fullFrameImageUrlWithOverlay` |
| `een.motionInRegionDetectionEvent.v1` | `motionRegion`, `objectDetection`, `croppedFrameImageUrl`, `fullFrameImageUrl` |
| `een.personDetectionEvent.v1` | `objectDetection`, `personAttributes`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `objectClassification`, `objectRegionMapping`, `geoLocation` |
| `een.animalDetectionEvent.v1` | `objectDetection`, `animalAttributes`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `objectClassification`, `objectRegionMapping` |
| `een.faceDetectionEvent.v1` | `objectDetection`, `personAttributes`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `objectClassification`, `objectRegionMapping` |
| `een.vehicleDetectionEvent.v1` | `objectDetection`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `objectClassification`, `vehicleAttributes`, `objectRegionMapping` |
| `een.gunDetectionEvent.v1` | `objectDetection`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `motionRegion`, `objectClassification`, `personAttributes`, `weaponAttributes`, `humanValidationDetails` |
| `een.fallDetectionEvent.v1` | `objectDetection`, `croppedFrameImageUrl`, `fullFrameImageUrl` |
| `een.fireDetectionEvent.v1` | `objectDetection`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `objectClassification` |
| `een.spillDetectionEvent.v1` | `objectDetection`, `objectClassification`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `displayOverlay.boundingBox`, `fullFrameImageUrlWithOverlay` |
| `een.crowdFormationDetectionEvent.v1` | `objectDetection`, `objectClassification`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `displayOverlay.boundingBox`, `fullFrameImageUrlWithOverlay` |

### Camera Analytics Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.tamperDetectionEvent.v1` | `fullFrameImageUrl` |
| `een.loiterDetectionEvent.v1` | `loiterArea`, `objectDetection`, `croppedFrameImageUrl`, `fullFrameImageUrl` |
| `een.objectLineCrossEvent.v1` | `lineCrossLine`, `objectDetection`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `entryDirection` |
| `een.objectIntrusionEvent.v1` | `intrusionArea`, `objectDetection`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `entryDirection` |
| `een.objectRemovalEvent.v1` | `monitoredArea`, `objectDetection`, `croppedFrameImageUrl`, `fullFrameImageUrl` |
| `een.personTailgateEvent.v1` | `objectDetection`, `croppedFrameImageUrl`, `fullFrameImageUrl` |
| `een.ppeViolationEvent.v1` | `objectDetection`, `personAttributes`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `objectClassification`, `objectRegionMapping` |

### AI/Scene Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.sceneLabelEvent.v1` | `objectDetection`, `personAttributes`, `vehicleAttributes`, `croppedFrameImageUrl`, `fullFrameImageUrl`, `objectClassification`, `objectRegionMapping`, `eevaAttributes`, `customLabels` |
| `een.eevaQueryEvent.v1` | `eevaAttributes`, `customLabels` |

### License Plate & Fleet Recognition Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.lprPlateReadEvent.v1` | `lprDetection`, `lprAccessType`, `vehicleAttributes`, `objectDetection`, `userData`, `croppedFrameImageUrl`, `fullFrameImageUrl` |
| `een.fleetCodeRecognitionEvent.v1` | `objectDetection`, `dotNumberRecognition`, `truckNumberRecognition`, `trailerNumberRecognition`, `recognizedText`, `croppedFrameImageUrl`, `fullFrameImageUrl` |

### Audio Detection Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.gunShotAudioDetectionEvent.v1` | `audioDetection`, `geoLocation` |
| `een.t3AlarmAudioDetectionEvent.v1` | `audioDetection` |
| `een.t4AlarmAudioDetectionEvent.v1` | `audioDetection` |

### POS (Point of Sale) Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.posTransactionEvent.v1` | `posTransactionStart`, `posTransactionEnd`, `posTransactionItem`, `posTransactionPayment`, `posTransactionCartChangeTrail`, `posTransactionCardLoadSummary`, `posTransactionFlag`, `posTransactionLabel` |

### Device & System Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.deviceCloudStatusUpdateEvent.v1` | `deviceCloudStatusUpdate`, `deviceCloudPreviousStatus` |
| `een.deviceIOEvent.v1` | `deviceIO` |
| `een.deviceOperationEvent.v1` | `deviceOperationDetails`, `deviceOperationSubStep` |
| `een.ptzPositionUpdateEvent.v1` | `ptzPositionUpdate` |

### Sensor Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.doorStatusEvent.v1` | `measurementStringValueUpdate` |
| `een.batteryLevelUpdateEvent.v1` | `batteryLevelUpdate` |
| `een.measurementThresholdStatusEvent.v1` | `measurementThresholdStatus`, `measurementValueUpdate` |
| `een.thermalCameraThresholdStatusEvent.v1` | `thermalCameraValueUpdate`, `thermalMonitoredArea` |

### Resource Management Events

All resource management events use `resourceDetails.v1`:

- `een.layoutCreationEvent.v1`, `een.layoutUpdateEvent.v1`, `een.layoutDeletionEvent.v1`
- `een.deviceCreationEvent.v1`, `een.deviceUpdateEvent.v1`, `een.deviceDeletionEvent.v1`
- `een.userCreationEvent.v1`, `een.userUpdateEvent.v1`, `een.userDeletionEvent.v1`
- `een.accountCreationEvent.v1`, `een.accountUpdateEvent.v1`, `een.accountDeletionEvent.v1`

### Job Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.jobCreationEvent.v1` | `jobDetails`, `ownerDetails` |
| `een.jobUpdateEvent.v1` | `jobDetails`, `ownerDetails` |
| `een.jobDeletionEvent.v1` | `ownerDetails` |

### Safety & Protocol Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.panicButtonEvent.v1` | `geoLocation` |
| `een.evacuateProtocolEvent.v1` | *(none)* |
| `een.holdProtocolEvent.v1` | *(none)* |
| `een.lockdownProtocolEvent.v1` | *(none)* |
| `een.secureProtocolEvent.v1` | *(none)* |
| `een.shelterProtocolEvent.v1` | *(none)* |

### Behavioral Events

These events have no associated data schemas:

- `een.violenceDetectionEvent.v1`
- `een.fightDetectionEvent.v1`
- `een.handsUpDetectionEvent.v1`
- `een.vapeDetectionEvent.v1`

---

## Common Data Schemas

These are the most commonly used data schemas across multiple event types:

| Schema | Description | Common Uses |
|--------|-------------|-------------|
| `een.objectDetection.v1` | Bounding box coordinates `[x1, y1, x2, y2]` (normalized 0-1) | Most detection events |
| `een.objectClassification.v1` | Object class label and confidence | Detection with classification |
| `een.fullFrameImageUrl.v1` | URL to full-frame event image | Most camera events |
| `een.croppedFrameImageUrl.v1` | URL to cropped image of detected object | Detection events |
| `een.personAttributes.v1` | Person-specific attributes (clothing, gender) | Person detection |
| `een.vehicleAttributes.v1` | Vehicle-specific attributes (make, model, color) | Vehicle detection |
| `een.eevaAttributes.v1` | EEVA AI query and response attributes | Scene label, EEVA query |
| `een.customLabels.v1` | Custom labels from AI analysis | Scene label, EEVA query |

---

## Vue Component Example

```vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  listEvents,
  listEventFieldValues,
  getIncludeParameterForEventTypes,
  type Camera,
  type Event
} from 'een-api-toolkit'

const props = defineProps<{ camera: Camera }>()

const availableEventTypes = ref<string[]>([])
const selectedEventTypes = ref<string[]>([])
const events = ref<Event[]>([])

// Dynamically compute include parameter based on selected event types
const includeParameter = computed(() => {
  return getIncludeParameterForEventTypes(selectedEventTypes.value)
})

async function fetchAvailableEventTypes() {
  const result = await listEventFieldValues({
    actor: `camera:${props.camera.id}`
  })
  if (!result.error) {
    availableEventTypes.value = result.data.type || []
    selectedEventTypes.value = [...availableEventTypes.value]
  }
}

async function fetchEvents() {
  if (selectedEventTypes.value.length === 0) return

  const result = await listEvents({
    actor: `camera:${props.camera.id}`,
    type__in: selectedEventTypes.value,
    startTimestamp__gte: new Date(Date.now() - 3600000).toISOString(),
    include: includeParameter.value
  })

  if (!result.error) {
    events.value = result.data.results
  }
}

// Refetch when selection changes
watch(selectedEventTypes, fetchEvents, { deep: true })
</script>
```

---

## Source

This mapping is derived from the Eagle Eye Networks API v3.0 specification (`events.yaml`).

## Maintenance

When new event types are added to the EEN API:
1. Check the API specification for the new event type
2. Find the `dataSchemas` array in the event schema
3. Add the mapping to `src/events/dataSchemas.ts`
4. Update the `KnownEventType` and `DataSchema` types as needed
