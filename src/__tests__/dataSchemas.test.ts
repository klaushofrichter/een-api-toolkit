import { describe, it, expect } from 'vitest'
import {
  EVENT_TYPE_DATA_SCHEMAS,
  getDataSchemasForEventType,
  getIncludeParameterForEventTypes,
  eventTypeHasDataSchemas,
  getEventTypesForDataSchema,
  getAllDataSchemas,
  getAllKnownEventTypes
} from '../events/dataSchemas'

describe('Event Data Schemas', () => {
  describe('EVENT_TYPE_DATA_SCHEMAS mapping', () => {
    it('should have at least 50 event types defined', () => {
      const eventTypes = Object.keys(EVENT_TYPE_DATA_SCHEMAS)
      expect(eventTypes.length).toBeGreaterThanOrEqual(50)
    })

    it('should have all event types follow een.*.v1 naming pattern', () => {
      const eventTypes = Object.keys(EVENT_TYPE_DATA_SCHEMAS)
      for (const eventType of eventTypes) {
        expect(eventType).toMatch(/^een\.\w+Event\.v\d+$/)
      }
    })

    it('should have arrays as values for all event types', () => {
      for (const [_eventType, schemas] of Object.entries(EVENT_TYPE_DATA_SCHEMAS)) {
        expect(Array.isArray(schemas)).toBe(true)
        expect(schemas).toBeInstanceOf(Array)
      }
    })

    it('should have all data schemas follow een.*.v1 naming pattern', () => {
      for (const [_eventType, schemas] of Object.entries(EVENT_TYPE_DATA_SCHEMAS)) {
        for (const schema of schemas) {
          expect(schema).toMatch(/^een\.\w+(\.\w+)*\.v\d+$/)
        }
      }
    })

    it('should have no duplicate schemas within a single event type', () => {
      for (const [_eventType, schemas] of Object.entries(EVENT_TYPE_DATA_SCHEMAS)) {
        const uniqueSchemas = new Set(schemas)
        expect(uniqueSchemas.size).toBe(schemas.length)
      }
    })

    it('should have common detection events with objectDetection schema', () => {
      const detectionEvents = [
        'een.motionDetectionEvent.v1',
        'een.personDetectionEvent.v1',
        'een.vehicleDetectionEvent.v1',
        'een.animalDetectionEvent.v1'
      ]

      for (const eventType of detectionEvents) {
        const schemas = EVENT_TYPE_DATA_SCHEMAS[eventType as keyof typeof EVENT_TYPE_DATA_SCHEMAS]
        expect(schemas).toBeDefined()
        expect(schemas).toContain('een.objectDetection.v1')
      }
    })

    it('should have image URL schemas for detection events', () => {
      const detectionEvents = [
        'een.motionDetectionEvent.v1',
        'een.personDetectionEvent.v1',
        'een.vehicleDetectionEvent.v1'
      ]

      for (const eventType of detectionEvents) {
        const schemas = EVENT_TYPE_DATA_SCHEMAS[eventType as keyof typeof EVENT_TYPE_DATA_SCHEMAS]
        expect(schemas).toBeDefined()
        // Should have at least one image URL schema
        const hasImageUrl = schemas.some(s =>
          s.includes('ImageUrl') || s.includes('croppedFrame') || s.includes('fullFrame')
        )
        expect(hasImageUrl).toBe(true)
      }
    })
  })

  describe('getDataSchemasForEventType', () => {
    it('should return schemas for known event types', () => {
      const schemas = getDataSchemasForEventType('een.personDetectionEvent.v1')
      expect(schemas.length).toBeGreaterThan(0)
      expect(schemas).toContain('een.objectDetection.v1')
    })

    it('should return empty array for unknown event types', () => {
      const schemas = getDataSchemasForEventType('een.unknownEvent.v1')
      expect(schemas).toEqual([])
    })

    it('should return empty array for invalid input', () => {
      expect(getDataSchemasForEventType('')).toEqual([])
      expect(getDataSchemasForEventType('invalid')).toEqual([])
    })

    it('should return readonly array that matches the mapping', () => {
      const schemas = getDataSchemasForEventType('een.motionDetectionEvent.v1')
      expect(schemas).toEqual(EVENT_TYPE_DATA_SCHEMAS['een.motionDetectionEvent.v1'])
    })
  })

  describe('getIncludeParameterForEventTypes', () => {
    it('should add data. prefix to all schemas', () => {
      const includeValues = getIncludeParameterForEventTypes(['een.tamperDetectionEvent.v1'])
      expect(includeValues.length).toBeGreaterThan(0)
      for (const value of includeValues) {
        expect(value).toMatch(/^data\.een\.\w+/)
      }
    })

    it('should deduplicate schemas across multiple event types', () => {
      const includeValues = getIncludeParameterForEventTypes([
        'een.personDetectionEvent.v1',
        'een.vehicleDetectionEvent.v1'
      ])

      // Both have objectDetection.v1, but it should appear only once
      const objectDetectionCount = includeValues.filter(v => v === 'data.een.objectDetection.v1').length
      expect(objectDetectionCount).toBe(1)
    })

    it('should return empty array for empty input', () => {
      expect(getIncludeParameterForEventTypes([])).toEqual([])
    })

    it('should return empty array for unknown event types', () => {
      expect(getIncludeParameterForEventTypes(['een.unknownEvent.v1'])).toEqual([])
    })

    it('should handle mixed known and unknown event types', () => {
      const includeValues = getIncludeParameterForEventTypes([
        'een.personDetectionEvent.v1',
        'een.unknownEvent.v1'
      ])
      // Should still return schemas from the known event type
      expect(includeValues.length).toBeGreaterThan(0)
    })
  })

  describe('eventTypeHasDataSchemas', () => {
    it('should return true for event types with schemas', () => {
      expect(eventTypeHasDataSchemas('een.personDetectionEvent.v1')).toBe(true)
      expect(eventTypeHasDataSchemas('een.motionDetectionEvent.v1')).toBe(true)
    })

    it('should return false for unknown event types', () => {
      expect(eventTypeHasDataSchemas('een.unknownEvent.v1')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(eventTypeHasDataSchemas('')).toBe(false)
    })
  })

  describe('getEventTypesForDataSchema', () => {
    it('should return event types for common schemas', () => {
      const eventTypes = getEventTypesForDataSchema('een.objectDetection.v1')
      expect(eventTypes.length).toBeGreaterThan(5)
      expect(eventTypes).toContain('een.personDetectionEvent.v1')
      expect(eventTypes).toContain('een.motionDetectionEvent.v1')
    })

    it('should return empty array for unknown schema', () => {
      expect(getEventTypesForDataSchema('een.unknownSchema.v1')).toEqual([])
    })

    it('should return empty array for empty string', () => {
      expect(getEventTypesForDataSchema('')).toEqual([])
    })

    it('should return specific event types for specialized schemas', () => {
      const eventTypes = getEventTypesForDataSchema('een.lprDetection.v1')
      expect(eventTypes).toContain('een.lprPlateReadEvent.v1')
    })
  })

  describe('getAllDataSchemas', () => {
    it('should return all unique schemas', () => {
      const schemas = getAllDataSchemas()
      expect(schemas.length).toBeGreaterThan(20)

      // Check for uniqueness
      const uniqueSchemas = new Set(schemas)
      expect(uniqueSchemas.size).toBe(schemas.length)
    })

    it('should include common schemas', () => {
      const schemas = getAllDataSchemas()
      expect(schemas).toContain('een.objectDetection.v1')
      expect(schemas).toContain('een.fullFrameImageUrl.v1')
    })

    it('should have all schemas follow naming pattern', () => {
      const schemas = getAllDataSchemas()
      for (const schema of schemas) {
        expect(schema).toMatch(/^een\.\w+(\.\w+)*\.v\d+$/)
      }
    })
  })

  describe('getAllKnownEventTypes', () => {
    it('should return all event types from the mapping', () => {
      const eventTypes = getAllKnownEventTypes()
      const mappingKeys = Object.keys(EVENT_TYPE_DATA_SCHEMAS)
      expect(eventTypes).toEqual(mappingKeys)
    })

    it('should return at least 50 event types', () => {
      const eventTypes = getAllKnownEventTypes()
      expect(eventTypes.length).toBeGreaterThanOrEqual(50)
    })

    it('should include common event types', () => {
      const eventTypes = getAllKnownEventTypes()
      expect(eventTypes).toContain('een.motionDetectionEvent.v1')
      expect(eventTypes).toContain('een.personDetectionEvent.v1')
      expect(eventTypes).toContain('een.vehicleDetectionEvent.v1')
      expect(eventTypes).toContain('een.tamperDetectionEvent.v1')
    })
  })

  describe('Data integrity', () => {
    it('should have consistent bidirectional mapping', () => {
      // For each event type, verify that getEventTypesForDataSchema returns it
      const allEventTypes = getAllKnownEventTypes()

      for (const eventType of allEventTypes) {
        const schemas = getDataSchemasForEventType(eventType)
        for (const schema of schemas) {
          const eventTypesForSchema = getEventTypesForDataSchema(schema)
          expect(eventTypesForSchema).toContain(eventType)
        }
      }
    })

    it('should have all schemas from getAllDataSchemas appear in at least one event type', () => {
      const allSchemas = getAllDataSchemas()

      for (const schema of allSchemas) {
        const eventTypes = getEventTypesForDataSchema(schema)
        expect(eventTypes.length).toBeGreaterThan(0)
      }
    })

    it('should have specific event categories', () => {
      const eventTypes = getAllKnownEventTypes()

      // Check for detection events
      const detectionEvents = eventTypes.filter(t => t.includes('Detection'))
      expect(detectionEvents.length).toBeGreaterThan(10)

      // Check for resource management events
      const resourceEvents = eventTypes.filter(t =>
        t.includes('Creation') || t.includes('Update') || t.includes('Deletion')
      )
      expect(resourceEvents.length).toBeGreaterThan(5)

      // Check for protocol events
      const protocolEvents = eventTypes.filter(t => t.includes('Protocol'))
      expect(protocolEvents.length).toBeGreaterThan(0)
    })
  })
})
