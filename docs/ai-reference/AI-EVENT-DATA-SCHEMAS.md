# Event Type to Data Schemas Mapping - EEN API Toolkit

> **Version:** 0.3.70
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
| `een.motionDetectionEvent.v1` | objectDetection, fullFrameImageUrl, croppedFrameImageUrl, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.motionInRegionDetectionEvent.v1` | motionRegion, objectDetection, fullFrameImageUrl, croppedFrameImageUrl, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.personDetectionEvent.v1` | objectDetection, personAttributes, fullFrameImageUrl, croppedFrameImageUrl, objectClassification, objectRegionMapping, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay, geoLocation |
| `een.personMotionDetectionEvent.v1` | objectDetection, fullFrameImageUrl, croppedFrameImageUrl, objectClassification |
| `een.animalDetectionEvent.v1` | objectDetection, animalAttributes, fullFrameImageUrl, croppedFrameImageUrl, objectClassification, objectRegionMapping, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.faceDetectionEvent.v1` | objectDetection, personAttributes, fullFrameImageUrl, croppedFrameImageUrl, objectClassification, objectRegionMapping, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.vehicleDetectionEvent.v1` | objectDetection, fullFrameImageUrl, croppedFrameImageUrl, objectClassification, vehicleAttributes, objectRegionMapping, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.vehicleMotionDetectionEvent.v1` | objectDetection, fullFrameImageUrl, croppedFrameImageUrl, objectClassification, vehicleAttributes |
| `een.gunDetectionEvent.v1` | fullFrameImageUrl, croppedFrameImageUrl, objectDetection, motionRegion, objectClassification, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay, weaponAttributes, personAttributes, humanValidationDetails |
| `een.weaponDetectionEvent.v1` | fullFrameImageUrl, croppedFrameImageUrl, objectDetection, motionRegion, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.fallDetectionEvent.v1` | objectDetection, fullFrameImageUrl, croppedFrameImageUrl, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.fireDetectionEvent.v1` | objectDetection, objectClassification, croppedFrameImageUrl, fullFrameImageUrl, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.spillDetectionEvent.v1` | objectDetection, objectClassification, croppedFrameImageUrl, fullFrameImageUrl, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.crowdFormationDetectionEvent.v1` | objectDetection, objectClassification, croppedFrameImageUrl, fullFrameImageUrl, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.tamperDetectionEvent.v1` | fullFrameImageUrl |
| `een.loiterDetectionEvent.v1` | loiterArea, objectDetection, fullFrameImageUrl, croppedFrameImageUrl, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.gunShotAudioDetectionEvent.v1` | audioDetection, geoLocation |
| `een.t3AlarmAudioDetectionEvent.v1` | audioDetection |
| `een.t4AlarmAudioDetectionEvent.v1` | audioDetection |
| `een.violenceDetectionEvent.v1` | *(none)* |
| `een.fightDetectionEvent.v1` | *(none)* |
| `een.handsUpDetectionEvent.v1` | *(none)* |
| `een.vapeDetectionEvent.v1` | *(none)* |

### Other Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.objectLineCrossEvent.v1` | lineCrossLine, objectDetection, fullFrameImageUrl, croppedFrameImageUrl, entryDirection, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.objectLineCrossCountEvent.v1` | lineCrossLine, objectDetection, fullFrameImageUrl, croppedFrameImageUrl, entryDirection, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.countedObjectLineCrossEvent.v1` | countedLineCross |
| `een.objectIntrusionEvent.v1` | intrusionArea, objectDetection, fullFrameImageUrl, croppedFrameImageUrl, entryDirection, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.objectRemovalEvent.v1` | monitoredArea, objectDetection, fullFrameImageUrl, croppedFrameImageUrl, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.personTailgateEvent.v1` | objectDetection, fullFrameImageUrl, croppedFrameImageUrl, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |
| `een.edgeReportedDeviceStatusEvent.v1` | deviceCommonStatusUpdate, deviceErrorStatusUpdate |

### Camera Analytics Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.ppeViolationEvent.v1` | objectDetection, personAttributes, fullFrameImageUrl, croppedFrameImageUrl, objectClassification, objectRegionMapping, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay |

### AI/Scene Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.sceneLabelEvent.v1` | objectDetection, objectClassification, vehicleAttributes, personAttributes, animalAttributes, croppedFrameImageUrl, fullFrameImageUrl, objectRegionMapping, displayOverlay.boundingBox, customLabels, eevaAttributes, fullFrameImageUrlWithOverlay |
| `een.eevaQueryEvent.v1` | customLabels, eevaAttributes, objectDetection, fullFrameImageUrl, fullFrameImageUrlWithOverlay, displayOverlay.boundingBox |

### License Plate & Fleet Recognition Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.lprPlateReadEvent.v1` | objectDetection, lprDetection, vehicleAttributes, lprAccessType, userData, userTags, croppedFrameImageUrl, fullFrameImageUrl, displayOverlay.boundingBox, fullFrameImageUrlWithOverlay, vehicleListInfo, resourceDetails, vspInsightsSummary |
| `een.fleetCodeRecognitionEvent.v1` | objectDetection, dotNumberRecognition, truckNumberRecognition, trailerNumberRecognition, croppedFrameImageUrl, fullFrameImageUrl, recognizedText, resourceDetails |

### POS (Point of Sale) Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.posTransactionEvent.v1` | posTransactionStart, posTransactionEnd, posTransactionItem, posTransactionPayment, posTransactionCartChangeTrail, posTransactionCardLoadSummary, posTransactionFlag, posTransactionLabel, rawData, displayLocationSummary, fullFrameImageUrl |

### Device & System Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.deviceCloudStatusUpdateEvent.v1` | deviceCloudStatusUpdate, deviceCloudPreviousStatus |
| `een.deviceCloudConnectionStatusUpdateEvent.v1` | deviceCloudConnectionStatusUpdate, deviceCloudConnectionPreviousStatus |
| `een.deviceIOEvent.v1` | deviceIO |
| `een.deviceOperationEvent.v1` | resourceDetails, deviceOperationDetails, deviceOperationSubStep, deviceOperationUpdate |
| `een.ptzPositionUpdateEvent.v1` | ptzPositionUpdate |
| `een.deviceCreationEvent.v1` | resourceDetails |
| `een.deviceUpdateEvent.v1` | resourceDetails |
| `een.deviceDeletionEvent.v1` | resourceDetails |

### Sensor Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.doorStatusEvent.v1` | measurementStringValueUpdate |
| `een.batteryLevelUpdateEvent.v1` | batteryLevelUpdate |
| `een.measurementThresholdStatusEvent.v1` | measurementThresholdStatus, measurementValueUpdate, measurementStringValueUpdate |
| `een.thermalCameraThresholdStatusEvent.v1` | thermalCameraValueUpdate, thermalMonitoredArea |

### Resource Management Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.layoutCreationEvent.v1` | resourceDetails |
| `een.layoutUpdateEvent.v1` | resourceDetails |
| `een.layoutDeletionEvent.v1` | resourceDetails |
| `een.userCreationEvent.v1` | resourceDetails |
| `een.userUpdateEvent.v1` | resourceDetails |
| `een.userDeletionEvent.v1` | resourceDetails |
| `een.accountCreationEvent.v1` | resourceDetails |
| `een.accountUpdateEvent.v1` | resourceDetails |
| `een.accountDeletionEvent.v1` | resourceDetails |
| `een.jobCreationEvent.v1` | jobDetails, ownerDetails |
| `een.jobUpdateEvent.v1` | jobDetails, ownerDetails |
| `een.jobDeletionEvent.v1` | ownerDetails |

### Safety & Protocol Events

| Event Type | Data Schemas |
|------------|--------------|
| `een.panicButtonEvent.v1` | geoLocation |
| `een.evacuateProtocolEvent.v1` | *(none)* |
| `een.holdProtocolEvent.v1` | *(none)* |
| `een.lockdownProtocolEvent.v1` | *(none)* |
| `een.secureProtocolEvent.v1` | *(none)* |
| `een.shelterProtocolEvent.v1` | *(none)* |

---

## Common Data Schemas

These are the most commonly used data schemas across multiple event types:

| Schema | Description | Common Uses |
|--------|-------------|-------------|
| `een.objectDetection.v1` | Bounding box coordinates `[x1, y1, x2, y2]` (normalized 0-1) | Most detection events |
| `een.objectClassification.v1` | Object class label and confidence | Detection with classification |
| `een.fullFrameImageUrl.v1` | URL to full-frame event image | Most camera events |
| `een.croppedFrameImageUrl.v1` | URL to cropped image of detected object | Detection events |
| `een.fullFrameImageUrlWithOverlay.v1` | URL to full-frame image with visual overlays | Detection events with overlays |
| `een.displayOverlay.boundingBox.v1` | Bounding box overlay data for visual display | Detection events |
| `een.personAttributes.v1` | Person-specific attributes (clothing, gender) | Person detection |
| `een.vehicleAttributes.v1` | Vehicle-specific attributes (make, model, color) | Vehicle detection |
| `een.animalAttributes.v1` | Animal-specific attributes | Animal detection |
| `een.eevaAttributes.v1` | EEVA AI query and response attributes | Scene label, EEVA query |
| `een.customLabels.v1` | Custom labels from AI analysis | Scene label, EEVA query |
| `een.countedLineCross.v1` | Aggregated count of objects crossing a line | Counting analytics |

---

## Vue Component Example

```vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  listEvents,
  listEventFieldValues,
  getIncludeParameterForEventTypes,
  getDataSchemasForEventType,
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

// Get schemas for a specific event (useful for JSON viewer)
function getEventSchemas(event: Event): string[] {
  return getDataSchemasForEventType(event.type)
}

// Refetch when selection changes
watch(selectedEventTypes, fetchEvents, { deep: true })
</script>
```

---

## Source

This mapping is derived from the Eagle Eye Networks API v3.0 specification (`events.yaml`).

## Maintenance

This file is auto-generated from `src/events/dataSchemas.ts` by `scripts/generate-event-data-schemas-doc.ts`.

To update:
1. Modify `src/events/dataSchemas.ts` with new event types or data schemas
2. Run `npm run docs:ai-context` to regenerate this file
3. The script automatically extracts types, mappings, and generates tables

Do not edit this file manually - changes will be overwritten on next generation.
