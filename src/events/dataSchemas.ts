/**
 * Event type to data schemas mapping for EEN API v3.0.
 *
 * @remarks
 * This module provides a mapping between Eagle Eye Networks event types and their
 * associated data schemas. This mapping is used to dynamically build the `include`
 * parameter when fetching events from the EEN API.
 *
 * When fetching events using the `listEvents` API, you can request additional
 * event-specific data by using the `include` parameter. Each event type supports
 * a specific set of data schemas.
 *
 * The `include` parameter values must be prefixed with `data.`. For example:
 * - Schema name: `een.objectDetection.v1`
 * - Include value: `data.een.objectDetection.v1`
 *
 * @example
 * ```typescript
 * import { getIncludeParameterForEventTypes, EVENT_TYPE_DATA_SCHEMAS } from 'een-api-toolkit'
 *
 * // Get include values for selected event types
 * const selectedTypes = ['een.personDetectionEvent.v1', 'een.vehicleDetectionEvent.v1']
 * const includeValues = getIncludeParameterForEventTypes(selectedTypes)
 *
 * // Use in API call
 * const result = await listEvents({
 *   actor: `camera:${cameraId}`,
 *   type__in: selectedTypes,
 *   startTimestamp__gte: startTime,
 *   include: includeValues
 * })
 * ```
 *
 * @category Events
 */

/**
 * Data schema identifier used in the EEN API.
 *
 * @remarks
 * These are the schema names as they appear in the event's `dataSchemas` array.
 * When using in the `include` parameter, prefix with `data.`.
 *
 * @category Events
 */
export type DataSchema =
  // Object detection and classification
  | 'een.objectDetection.v1'
  | 'een.objectClassification.v1'
  | 'een.objectRegionMapping.v1'
  // Image URLs
  | 'een.fullFrameImageUrl.v1'
  | 'een.croppedFrameImageUrl.v1'
  | 'een.fullFrameImageUrlWithOverlay.v1'
  | 'een.displayOverlay.boundingBox.v1'
  // Person and vehicle attributes
  | 'een.personAttributes.v1'
  | 'een.vehicleAttributes.v1'
  | 'een.animalAttributes.v1'
  | 'een.weaponAttributes.v1'
  // Location and direction
  | 'een.geoLocation.v1'
  | 'een.entryDirection.v1'
  // Areas and regions
  | 'een.motionRegion.v1'
  | 'een.loiterArea.v1'
  | 'een.lineCrossLine.v1'
  | 'een.intrusionArea.v1'
  | 'een.monitoredArea.v1'
  | 'een.thermalMonitoredArea.v1'
  // AI and scene analysis
  | 'een.eevaAttributes.v1'
  | 'een.customLabels.v1'
  | 'een.humanValidationDetails.v1'
  // License plate recognition
  | 'een.lprDetection.v1'
  | 'een.lprAccessType.v1'
  | 'een.userData.v1'
  // Fleet recognition
  | 'een.dotNumberRecognition.v1'
  | 'een.truckNumberRecognition.v1'
  | 'een.trailerNumberRecognition.v1'
  | 'een.recognizedText.v1'
  // Audio
  | 'een.audioDetection.v1'
  // POS (Point of Sale)
  | 'een.posTransactionStart.v1'
  | 'een.posTransactionEnd.v1'
  | 'een.posTransactionItem.v1'
  | 'een.posTransactionPayment.v1'
  | 'een.posTransactionCartChangeTrail.v1'
  | 'een.posTransactionCardLoadSummary.v1'
  | 'een.posTransactionFlag.v1'
  | 'een.posTransactionLabel.v1'
  // Device and system
  | 'een.deviceCloudStatusUpdate.v1'
  | 'een.deviceCloudPreviousStatus.v1'
  | 'een.deviceIO.v1'
  | 'een.deviceOperationDetails.v1'
  | 'een.deviceOperationSubStep.v1'
  | 'een.ptzPositionUpdate.v1'
  // Sensor
  | 'een.measurementStringValueUpdate.v1'
  | 'een.batteryLevelUpdate.v1'
  | 'een.measurementThresholdStatus.v1'
  | 'een.measurementValueUpdate.v1'
  | 'een.thermalCameraValueUpdate.v1'
  // Resource management
  | 'een.resourceDetails.v1'
  // Job
  | 'een.jobDetails.v1'
  | 'een.ownerDetails.v1'

/**
 * Known EEN event type identifier.
 *
 * @remarks
 * These are the event types defined in the EEN API v3.0 specification.
 *
 * @category Events
 */
export type KnownEventType =
  // Detection events
  | 'een.motionDetectionEvent.v1'
  | 'een.motionInRegionDetectionEvent.v1'
  | 'een.personDetectionEvent.v1'
  | 'een.animalDetectionEvent.v1'
  | 'een.faceDetectionEvent.v1'
  | 'een.vehicleDetectionEvent.v1'
  | 'een.gunDetectionEvent.v1'
  | 'een.fallDetectionEvent.v1'
  | 'een.fireDetectionEvent.v1'
  | 'een.spillDetectionEvent.v1'
  | 'een.crowdFormationDetectionEvent.v1'
  // Camera analytics events
  | 'een.tamperDetectionEvent.v1'
  | 'een.loiterDetectionEvent.v1'
  | 'een.objectLineCrossEvent.v1'
  | 'een.objectIntrusionEvent.v1'
  | 'een.objectRemovalEvent.v1'
  | 'een.personTailgateEvent.v1'
  | 'een.ppeViolationEvent.v1'
  // AI/Scene events
  | 'een.sceneLabelEvent.v1'
  | 'een.eevaQueryEvent.v1'
  // License plate and fleet recognition
  | 'een.lprPlateReadEvent.v1'
  | 'een.fleetCodeRecognitionEvent.v1'
  // Audio detection
  | 'een.gunShotAudioDetectionEvent.v1'
  | 'een.t3AlarmAudioDetectionEvent.v1'
  | 'een.t4AlarmAudioDetectionEvent.v1'
  // POS events
  | 'een.posTransactionEvent.v1'
  // Device and system events
  | 'een.deviceCloudStatusUpdateEvent.v1'
  | 'een.deviceIOEvent.v1'
  | 'een.deviceOperationEvent.v1'
  | 'een.ptzPositionUpdateEvent.v1'
  // Sensor events
  | 'een.doorStatusEvent.v1'
  | 'een.batteryLevelUpdateEvent.v1'
  | 'een.measurementThresholdStatusEvent.v1'
  | 'een.thermalCameraThresholdStatusEvent.v1'
  // Resource management events
  | 'een.layoutCreationEvent.v1'
  | 'een.layoutUpdateEvent.v1'
  | 'een.layoutDeletionEvent.v1'
  | 'een.deviceCreationEvent.v1'
  | 'een.deviceUpdateEvent.v1'
  | 'een.deviceDeletionEvent.v1'
  | 'een.userCreationEvent.v1'
  | 'een.userUpdateEvent.v1'
  | 'een.userDeletionEvent.v1'
  | 'een.accountCreationEvent.v1'
  | 'een.accountUpdateEvent.v1'
  | 'een.accountDeletionEvent.v1'
  // Job events
  | 'een.jobCreationEvent.v1'
  | 'een.jobUpdateEvent.v1'
  | 'een.jobDeletionEvent.v1'
  // Safety and protocol events
  | 'een.panicButtonEvent.v1'
  | 'een.evacuateProtocolEvent.v1'
  | 'een.holdProtocolEvent.v1'
  | 'een.lockdownProtocolEvent.v1'
  | 'een.secureProtocolEvent.v1'
  | 'een.shelterProtocolEvent.v1'
  // Behavioral events
  | 'een.violenceDetectionEvent.v1'
  | 'een.fightDetectionEvent.v1'
  | 'een.handsUpDetectionEvent.v1'
  | 'een.vapeDetectionEvent.v1'

/**
 * Mapping of event types to their supported data schemas.
 *
 * @remarks
 * This is a complete mapping derived from the EEN API v3.0 specification.
 * When an event type has no associated data schemas, it maps to an empty array.
 *
 * @example
 * ```typescript
 * import { EVENT_TYPE_DATA_SCHEMAS } from 'een-api-toolkit'
 *
 * // Get schemas for a specific event type
 * const schemas = EVENT_TYPE_DATA_SCHEMAS['een.personDetectionEvent.v1']
 * // ['een.objectDetection.v1', 'een.personAttributes.v1', ...]
 * ```
 *
 * @category Events
 */
export const EVENT_TYPE_DATA_SCHEMAS: Readonly<Record<KnownEventType, readonly DataSchema[]>> = {
  // Detection events
  'een.motionDetectionEvent.v1': [
    'een.objectDetection.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.displayOverlay.boundingBox.v1',
    'een.fullFrameImageUrlWithOverlay.v1'
  ],
  'een.motionInRegionDetectionEvent.v1': [
    'een.motionRegion.v1',
    'een.objectDetection.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1'
  ],
  'een.personDetectionEvent.v1': [
    'een.objectDetection.v1',
    'een.personAttributes.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.objectClassification.v1',
    'een.objectRegionMapping.v1',
    'een.geoLocation.v1'
  ],
  'een.animalDetectionEvent.v1': [
    'een.objectDetection.v1',
    'een.animalAttributes.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.objectClassification.v1',
    'een.objectRegionMapping.v1'
  ],
  'een.faceDetectionEvent.v1': [
    'een.objectDetection.v1',
    'een.personAttributes.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.objectClassification.v1',
    'een.objectRegionMapping.v1'
  ],
  'een.vehicleDetectionEvent.v1': [
    'een.objectDetection.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.objectClassification.v1',
    'een.vehicleAttributes.v1',
    'een.objectRegionMapping.v1'
  ],
  'een.gunDetectionEvent.v1': [
    'een.objectDetection.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.motionRegion.v1',
    'een.objectClassification.v1',
    'een.personAttributes.v1',
    'een.weaponAttributes.v1',
    'een.humanValidationDetails.v1'
  ],
  'een.fallDetectionEvent.v1': [
    'een.objectDetection.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1'
  ],
  'een.fireDetectionEvent.v1': [
    'een.objectDetection.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.objectClassification.v1'
  ],
  'een.spillDetectionEvent.v1': [
    'een.objectDetection.v1',
    'een.objectClassification.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.displayOverlay.boundingBox.v1',
    'een.fullFrameImageUrlWithOverlay.v1'
  ],
  'een.crowdFormationDetectionEvent.v1': [
    'een.objectDetection.v1',
    'een.objectClassification.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.displayOverlay.boundingBox.v1',
    'een.fullFrameImageUrlWithOverlay.v1'
  ],

  // Camera analytics events
  'een.tamperDetectionEvent.v1': [
    'een.fullFrameImageUrl.v1'
  ],
  'een.loiterDetectionEvent.v1': [
    'een.loiterArea.v1',
    'een.objectDetection.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1'
  ],
  'een.objectLineCrossEvent.v1': [
    'een.lineCrossLine.v1',
    'een.objectDetection.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.entryDirection.v1'
  ],
  'een.objectIntrusionEvent.v1': [
    'een.intrusionArea.v1',
    'een.objectDetection.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.entryDirection.v1'
  ],
  'een.objectRemovalEvent.v1': [
    'een.monitoredArea.v1',
    'een.objectDetection.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1'
  ],
  'een.personTailgateEvent.v1': [
    'een.objectDetection.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1'
  ],
  'een.ppeViolationEvent.v1': [
    'een.objectDetection.v1',
    'een.personAttributes.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.objectClassification.v1',
    'een.objectRegionMapping.v1'
  ],

  // AI/Scene events
  'een.sceneLabelEvent.v1': [
    'een.objectDetection.v1',
    'een.personAttributes.v1',
    'een.vehicleAttributes.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1',
    'een.objectClassification.v1',
    'een.objectRegionMapping.v1',
    'een.eevaAttributes.v1',
    'een.customLabels.v1'
  ],
  'een.eevaQueryEvent.v1': [
    'een.eevaAttributes.v1',
    'een.customLabels.v1'
  ],

  // License plate and fleet recognition
  'een.lprPlateReadEvent.v1': [
    'een.lprDetection.v1',
    'een.lprAccessType.v1',
    'een.vehicleAttributes.v1',
    'een.objectDetection.v1',
    'een.userData.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1'
  ],
  'een.fleetCodeRecognitionEvent.v1': [
    'een.objectDetection.v1',
    'een.dotNumberRecognition.v1',
    'een.truckNumberRecognition.v1',
    'een.trailerNumberRecognition.v1',
    'een.recognizedText.v1',
    'een.croppedFrameImageUrl.v1',
    'een.fullFrameImageUrl.v1'
  ],

  // Audio detection
  'een.gunShotAudioDetectionEvent.v1': [
    'een.audioDetection.v1',
    'een.geoLocation.v1'
  ],
  'een.t3AlarmAudioDetectionEvent.v1': [
    'een.audioDetection.v1'
  ],
  'een.t4AlarmAudioDetectionEvent.v1': [
    'een.audioDetection.v1'
  ],

  // POS events
  'een.posTransactionEvent.v1': [
    'een.posTransactionStart.v1',
    'een.posTransactionEnd.v1',
    'een.posTransactionItem.v1',
    'een.posTransactionPayment.v1',
    'een.posTransactionCartChangeTrail.v1',
    'een.posTransactionCardLoadSummary.v1',
    'een.posTransactionFlag.v1',
    'een.posTransactionLabel.v1'
  ],

  // Device and system events
  'een.deviceCloudStatusUpdateEvent.v1': [
    'een.deviceCloudStatusUpdate.v1',
    'een.deviceCloudPreviousStatus.v1'
  ],
  'een.deviceIOEvent.v1': [
    'een.deviceIO.v1'
  ],
  'een.deviceOperationEvent.v1': [
    'een.deviceOperationDetails.v1',
    'een.deviceOperationSubStep.v1'
  ],
  'een.ptzPositionUpdateEvent.v1': [
    'een.ptzPositionUpdate.v1'
  ],

  // Sensor events
  'een.doorStatusEvent.v1': [
    'een.measurementStringValueUpdate.v1'
  ],
  'een.batteryLevelUpdateEvent.v1': [
    'een.batteryLevelUpdate.v1'
  ],
  'een.measurementThresholdStatusEvent.v1': [
    'een.measurementThresholdStatus.v1',
    'een.measurementValueUpdate.v1'
  ],
  'een.thermalCameraThresholdStatusEvent.v1': [
    'een.thermalCameraValueUpdate.v1',
    'een.thermalMonitoredArea.v1'
  ],

  // Resource management events
  'een.layoutCreationEvent.v1': ['een.resourceDetails.v1'],
  'een.layoutUpdateEvent.v1': ['een.resourceDetails.v1'],
  'een.layoutDeletionEvent.v1': ['een.resourceDetails.v1'],
  'een.deviceCreationEvent.v1': ['een.resourceDetails.v1'],
  'een.deviceUpdateEvent.v1': ['een.resourceDetails.v1'],
  'een.deviceDeletionEvent.v1': ['een.resourceDetails.v1'],
  'een.userCreationEvent.v1': ['een.resourceDetails.v1'],
  'een.userUpdateEvent.v1': ['een.resourceDetails.v1'],
  'een.userDeletionEvent.v1': ['een.resourceDetails.v1'],
  'een.accountCreationEvent.v1': ['een.resourceDetails.v1'],
  'een.accountUpdateEvent.v1': ['een.resourceDetails.v1'],
  'een.accountDeletionEvent.v1': ['een.resourceDetails.v1'],

  // Job events
  'een.jobCreationEvent.v1': ['een.jobDetails.v1', 'een.ownerDetails.v1'],
  'een.jobUpdateEvent.v1': ['een.jobDetails.v1', 'een.ownerDetails.v1'],
  'een.jobDeletionEvent.v1': ['een.ownerDetails.v1'],

  // Safety and protocol events (no data schemas)
  'een.panicButtonEvent.v1': ['een.geoLocation.v1'],
  'een.evacuateProtocolEvent.v1': [],
  'een.holdProtocolEvent.v1': [],
  'een.lockdownProtocolEvent.v1': [],
  'een.secureProtocolEvent.v1': [],
  'een.shelterProtocolEvent.v1': [],

  // Behavioral events (no data schemas)
  'een.violenceDetectionEvent.v1': [],
  'een.fightDetectionEvent.v1': [],
  'een.handsUpDetectionEvent.v1': [],
  'een.vapeDetectionEvent.v1': []
} as const

/**
 * Get the data schemas supported by a specific event type.
 *
 * @remarks
 * Returns an array of data schema names for the given event type.
 * If the event type is not recognized, returns an empty array.
 *
 * @param eventType - The event type identifier (e.g., "een.personDetectionEvent.v1")
 * @returns Array of data schema names (without "data." prefix)
 *
 * @example
 * ```typescript
 * import { getDataSchemasForEventType } from 'een-api-toolkit'
 *
 * const schemas = getDataSchemasForEventType('een.personDetectionEvent.v1')
 * // ['een.objectDetection.v1', 'een.personAttributes.v1', ...]
 * ```
 *
 * @category Events
 */
export function getDataSchemasForEventType(eventType: string): readonly string[] {
  return EVENT_TYPE_DATA_SCHEMAS[eventType as KnownEventType] ?? []
}

/**
 * Get the include parameter values for multiple event types.
 *
 * @remarks
 * Combines all data schemas from the specified event types, removes duplicates,
 * and returns them with the required "data." prefix for use in the `include` parameter.
 *
 * @param eventTypes - Array of event type identifiers
 * @returns Array of include parameter values (with "data." prefix), deduplicated
 *
 * @example
 * ```typescript
 * import { getIncludeParameterForEventTypes, listEvents } from 'een-api-toolkit'
 *
 * const selectedTypes = ['een.personDetectionEvent.v1', 'een.vehicleDetectionEvent.v1']
 * const includeValues = getIncludeParameterForEventTypes(selectedTypes)
 *
 * // Use in API call
 * const result = await listEvents({
 *   actor: `camera:${cameraId}`,
 *   type__in: selectedTypes,
 *   startTimestamp__gte: startTime,
 *   include: includeValues
 * })
 * ```
 *
 * @category Events
 */
export function getIncludeParameterForEventTypes(eventTypes: string[]): string[] {
  const schemaSet = new Set<string>()

  for (const eventType of eventTypes) {
    const schemas = getDataSchemasForEventType(eventType)
    for (const schema of schemas) {
      schemaSet.add(`data.${schema}`)
    }
  }

  return Array.from(schemaSet)
}

/**
 * Check if an event type has any associated data schemas.
 *
 * @remarks
 * Returns true if the event type has at least one associated data schema.
 * Useful for determining whether to include the `include` parameter in API calls.
 *
 * @param eventType - The event type identifier
 * @returns True if the event type has data schemas, false otherwise
 *
 * @example
 * ```typescript
 * import { eventTypeHasDataSchemas } from 'een-api-toolkit'
 *
 * if (eventTypeHasDataSchemas('een.personDetectionEvent.v1')) {
 *   // Include data schemas in the API call
 * }
 * ```
 *
 * @category Events
 */
export function eventTypeHasDataSchemas(eventType: string): boolean {
  const schemas = getDataSchemasForEventType(eventType)
  return schemas.length > 0
}

/**
 * Get all known event types that have the specified data schema.
 *
 * @remarks
 * Returns an array of event types that include the specified data schema.
 * Useful for finding which event types support a particular data feature.
 *
 * @param schema - The data schema name (without "data." prefix)
 * @returns Array of event type identifiers that support the schema
 *
 * @example
 * ```typescript
 * import { getEventTypesForDataSchema } from 'een-api-toolkit'
 *
 * const eventTypes = getEventTypesForDataSchema('een.objectDetection.v1')
 * // ['een.motionDetectionEvent.v1', 'een.personDetectionEvent.v1', ...]
 * ```
 *
 * @category Events
 */
export function getEventTypesForDataSchema(schema: string): string[] {
  const eventTypes: string[] = []

  for (const [eventType, schemas] of Object.entries(EVENT_TYPE_DATA_SCHEMAS)) {
    if (schemas.includes(schema as DataSchema)) {
      eventTypes.push(eventType)
    }
  }

  return eventTypes
}

/**
 * Get all unique data schemas across all event types.
 *
 * @remarks
 * Returns a deduplicated array of all data schema names defined in the mapping.
 * Useful for understanding the complete set of available data schemas.
 *
 * @returns Array of all unique data schema names
 *
 * @example
 * ```typescript
 * import { getAllDataSchemas } from 'een-api-toolkit'
 *
 * const allSchemas = getAllDataSchemas()
 * // ['een.objectDetection.v1', 'een.fullFrameImageUrl.v1', ...]
 * ```
 *
 * @category Events
 */
export function getAllDataSchemas(): string[] {
  const schemaSet = new Set<string>()

  for (const schemas of Object.values(EVENT_TYPE_DATA_SCHEMAS)) {
    for (const schema of schemas) {
      schemaSet.add(schema)
    }
  }

  return Array.from(schemaSet)
}

/**
 * Get all known event types.
 *
 * @remarks
 * Returns an array of all event type identifiers defined in the mapping.
 *
 * @returns Array of all known event type identifiers
 *
 * @example
 * ```typescript
 * import { getAllKnownEventTypes } from 'een-api-toolkit'
 *
 * const allTypes = getAllKnownEventTypes()
 * // ['een.motionDetectionEvent.v1', 'een.personDetectionEvent.v1', ...]
 * ```
 *
 * @category Events
 */
export function getAllKnownEventTypes(): string[] {
  return Object.keys(EVENT_TYPE_DATA_SCHEMAS)
}
