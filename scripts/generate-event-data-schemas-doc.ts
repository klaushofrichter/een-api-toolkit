#!/usr/bin/env npx tsx
/**
 * Generate AI-EVENT-DATA-SCHEMAS.md documentation from src/events/dataSchemas.ts.
 *
 * This script reads the TypeScript source file and generates comprehensive
 * markdown documentation including all event types, data schemas, and mappings.
 *
 * Usage:
 *   npx tsx scripts/generate-event-data-schemas-doc.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.dirname(__dirname)
const SOURCE_FILE = path.join(ROOT_DIR, 'src/events/dataSchemas.ts')
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs/ai-reference/AI-EVENT-DATA-SCHEMAS.md')

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'))
const VERSION = packageJson.version

/**
 * Parse DataSchema type union from source code.
 */
function parseDataSchemas(sourceCode: string): string[] {
  const match = sourceCode.match(/export type DataSchema =\s*([\s\S]*?)(?=\n\n\/\*\*|\nexport type KnownEventType)/m)
  if (!match) return []

  const typeContent = match[1]
  const schemas: string[] = []
  const schemaRegex = /['"]([^'"]+)['"]/g
  let schemaMatch

  while ((schemaMatch = schemaRegex.exec(typeContent)) !== null) {
    schemas.push(schemaMatch[1])
  }

  return schemas
}

/**
 * Parse KnownEventType type union from source code.
 */
function parseKnownEventTypes(sourceCode: string): string[] {
  const match = sourceCode.match(/export type KnownEventType =\s*([\s\S]*?)(?=\n\n\/\*\*|\nexport const EVENT_TYPE_DATA_SCHEMAS)/m)
  if (!match) return []

  const typeContent = match[1]
  const eventTypes: string[] = []
  const eventTypeRegex = /['"]([^'"]+)['"]/g
  let eventTypeMatch

  while ((eventTypeMatch = eventTypeRegex.exec(typeContent)) !== null) {
    eventTypes.push(eventTypeMatch[1])
  }

  return eventTypes
}

/**
 * Parse EVENT_TYPE_DATA_SCHEMAS mapping from source code.
 */
function parseEventTypeDataSchemasMapping(sourceCode: string): Record<string, string[]> {
  const match = sourceCode.match(/export const EVENT_TYPE_DATA_SCHEMAS[^=]*=\s*{([\s\S]*?)}\s+as const/m)
  if (!match) return {}

  const mappingContent = match[1]
  const mapping: Record<string, string[]> = {}

  // Match event type entries like:  'een.motionDetectionEvent.v1': [...]
  const entryRegex = /['"]([^'"]+)['"]\s*:\s*\[([\s\S]*?)\]/g
  let entryMatch

  while ((entryMatch = entryRegex.exec(mappingContent)) !== null) {
    const eventType = entryMatch[1]
    const schemasArray = entryMatch[2]

    // Extract schema names from the array
    const schemas: string[] = []
    const schemaRegex = /['"]([^'"]+)['"]/g
    let schemaMatch

    while ((schemaMatch = schemaRegex.exec(schemasArray)) !== null) {
      schemas.push(schemaMatch[1])
    }

    mapping[eventType] = schemas
  }

  return mapping
}

/**
 * Remove 'een.' prefix and '.v1' suffix from schema names for display.
 */
function formatSchemaName(schema: string): string {
  return schema.replace(/^een\./, '').replace(/\.v\d+$/, '')
}

/**
 * Group event types by category based on their naming patterns.
 */
function groupEventTypesByCategory(eventTypes: string[]): Map<string, string[]> {
  const categories = new Map<string, string[]>()

  const categoryPatterns = [
    { name: 'Detection Events', pattern: /Detection.*Event/ },
    { name: 'Camera Analytics Events', pattern: /(tamper|loiter|lineCross|intrusion|removal|tailgate|ppe).*Event/ },
    { name: 'AI/Scene Events', pattern: /(scene|eeva).*Event/ },
    { name: 'License Plate & Fleet Recognition Events', pattern: /(lpr|fleet).*Event/ },
    { name: 'Audio Detection Events', pattern: /Audio.*Event/ },
    { name: 'POS (Point of Sale) Events', pattern: /pos.*Event/ },
    { name: 'Device & System Events', pattern: /(device|ptz).*Event/ },
    { name: 'Sensor Events', pattern: /(door|battery|measurement|thermal).*Event/ },
    { name: 'Resource Management Events', pattern: /(Creation|Update|Deletion)Event/ },
    { name: 'Job Events', pattern: /job.*Event/ },
    { name: 'Safety & Protocol Events', pattern: /(panic|evacuate|hold|lockdown|secure|shelter).*Event/ },
    { name: 'Behavioral Events', pattern: /(violence|fight|handsUp|vape).*Event/ }
  ]

  for (const eventType of eventTypes) {
    let categorized = false
    for (const { name, pattern } of categoryPatterns) {
      if (pattern.test(eventType)) {
        if (!categories.has(name)) {
          categories.set(name, [])
        }
        categories.get(name)!.push(eventType)
        categorized = true
        break
      }
    }
    if (!categorized) {
      if (!categories.has('Other Events')) {
        categories.set('Other Events', [])
      }
      categories.get('Other Events')!.push(eventType)
    }
  }

  return categories
}

/**
 * Generate markdown content for the AI-EVENT-DATA-SCHEMAS.md file.
 */
function generateDocumentation(
  version: string,
  dataSchemas: string[],
  eventTypes: string[],
  mapping: Record<string, string[]>
): string {
  const categories = groupEventTypesByCategory(eventTypes)

  let content = `# Event Type to Data Schemas Mapping - EEN API Toolkit

> **Version:** ${version}
>
> Complete reference for event type to data schema mappings.
> Load this document when building dynamic event queries with the \`include\` parameter.

---

## Overview

When fetching events using the \`listEvents\` API, you can request additional event-specific data by using the \`include\` parameter. Each event type supports a specific set of data schemas. The toolkit provides a static mapping and utility functions to help you build the correct \`include\` parameter dynamically.

### Key Concept

- **Schema names** appear in the event's \`dataSchemas\` array (e.g., \`een.objectDetection.v1\`)
- **Include values** require the \`data.\` prefix (e.g., \`data.een.objectDetection.v1\`)

---

## Exported Functions

### getIncludeParameterForEventTypes(eventTypes)

Get the include parameter values for multiple event types. Combines all schemas, removes duplicates, and adds the \`data.\` prefix.

\`\`\`typescript
import { getIncludeParameterForEventTypes, listEvents } from 'een-api-toolkit'

const selectedTypes = ['een.personDetectionEvent.v1', 'een.vehicleDetectionEvent.v1']
const includeValues = getIncludeParameterForEventTypes(selectedTypes)
// ['data.een.objectDetection.v1', 'data.een.personAttributes.v1', ...]

const result = await listEvents({
  actor: \`camera:\${cameraId}\`,
  type__in: selectedTypes,
  startTimestamp__gte: startTime,
  include: includeValues
})
\`\`\`

### getDataSchemasForEventType(eventType)

Get the data schemas for a specific event type (without \`data.\` prefix).

\`\`\`typescript
import { getDataSchemasForEventType } from 'een-api-toolkit'

const schemas = getDataSchemasForEventType('een.personDetectionEvent.v1')
// ['een.objectDetection.v1', 'een.personAttributes.v1', ...]
\`\`\`

### eventTypeHasDataSchemas(eventType)

Check if an event type has any associated data schemas.

\`\`\`typescript
import { eventTypeHasDataSchemas } from 'een-api-toolkit'

if (eventTypeHasDataSchemas('een.personDetectionEvent.v1')) {
  // Include data schemas in the API call
}
\`\`\`

### getEventTypesForDataSchema(schema)

Find which event types support a specific data schema.

\`\`\`typescript
import { getEventTypesForDataSchema } from 'een-api-toolkit'

const eventTypes = getEventTypesForDataSchema('een.objectDetection.v1')
// ['een.motionDetectionEvent.v1', 'een.personDetectionEvent.v1', ...]
\`\`\`

### getAllDataSchemas()

Get all unique data schemas across all event types.

\`\`\`typescript
import { getAllDataSchemas } from 'een-api-toolkit'

const allSchemas = getAllDataSchemas()
// ['een.objectDetection.v1', 'een.fullFrameImageUrl.v1', ...]
\`\`\`

### getAllKnownEventTypes()

Get all known event types defined in the mapping.

\`\`\`typescript
import { getAllKnownEventTypes } from 'een-api-toolkit'

const allTypes = getAllKnownEventTypes()
// ['een.motionDetectionEvent.v1', 'een.personDetectionEvent.v1', ...]
\`\`\`

---

## Static Mapping

The \`EVENT_TYPE_DATA_SCHEMAS\` constant provides the complete mapping:

\`\`\`typescript
import { EVENT_TYPE_DATA_SCHEMAS } from 'een-api-toolkit'

const schemas = EVENT_TYPE_DATA_SCHEMAS['een.personDetectionEvent.v1']
// ['een.objectDetection.v1', 'een.personAttributes.v1', ...]
\`\`\`

---

## Event Type to Data Schemas Reference

`

  // Generate tables for each category
  for (const [category, types] of categories) {
    if (types.length === 0) continue

    content += `\n### ${category}\n\n`
    content += `| Event Type | Data Schemas |\n`
    content += `|------------|--------------|`

    for (const eventType of types) {
      const schemas = mapping[eventType] || []
      const formattedSchemas = schemas.length > 0
        ? schemas.map(formatSchemaName).join(', ')
        : '*(none)*'

      content += `\n| \`${eventType}\` | ${formattedSchemas} |`
    }

    content += '\n'
  }

  // Add common schemas section
  content += `\n---

## Common Data Schemas

These are the most commonly used data schemas across multiple event types:

| Schema | Description | Common Uses |
|--------|-------------|-------------|
| \`een.objectDetection.v1\` | Bounding box coordinates \`[x1, y1, x2, y2]\` (normalized 0-1) | Most detection events |
| \`een.objectClassification.v1\` | Object class label and confidence | Detection with classification |
| \`een.fullFrameImageUrl.v1\` | URL to full-frame event image | Most camera events |
| \`een.croppedFrameImageUrl.v1\` | URL to cropped image of detected object | Detection events |
| \`een.fullFrameImageUrlWithOverlay.v1\` | URL to full-frame image with visual overlays | Detection events with overlays |
| \`een.displayOverlay.boundingBox.v1\` | Bounding box overlay data for visual display | Detection events |
| \`een.personAttributes.v1\` | Person-specific attributes (clothing, gender) | Person detection |
| \`een.vehicleAttributes.v1\` | Vehicle-specific attributes (make, model, color) | Vehicle detection |
| \`een.animalAttributes.v1\` | Animal-specific attributes | Animal detection |
| \`een.eevaAttributes.v1\` | EEVA AI query and response attributes | Scene label, EEVA query |
| \`een.customLabels.v1\` | Custom labels from AI analysis | Scene label, EEVA query |
| \`een.countedLineCross.v1\` | Aggregated count of objects crossing a line | Counting analytics |

---

## Vue Component Example

\`\`\`vue
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
    actor: \`camera:\${props.camera.id}\`
  })
  if (!result.error) {
    availableEventTypes.value = result.data.type || []
    selectedEventTypes.value = [...availableEventTypes.value]
  }
}

async function fetchEvents() {
  if (selectedEventTypes.value.length === 0) return

  const result = await listEvents({
    actor: \`camera:\${props.camera.id}\`,
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
\`\`\`

---

## Source

This mapping is derived from the Eagle Eye Networks API v3.0 specification (\`events.yaml\`).

## Maintenance

This file is auto-generated from \`src/events/dataSchemas.ts\` by \`scripts/generate-event-data-schemas-doc.ts\`.

To update:
1. Modify \`src/events/dataSchemas.ts\` with new event types or data schemas
2. Run \`npm run docs:ai-context\` to regenerate this file
3. The script automatically extracts types, mappings, and generates tables

Do not edit this file manually - changes will be overwritten on next generation.
`

  return content
}

/**
 * Main execution function.
 */
function main(): void {
  console.log('Generating AI-EVENT-DATA-SCHEMAS.md from source code...')

  // Read source file
  const sourceCode = fs.readFileSync(SOURCE_FILE, 'utf-8')

  // Parse TypeScript source
  const dataSchemas = parseDataSchemas(sourceCode)
  const eventTypes = parseKnownEventTypes(sourceCode)
  const mapping = parseEventTypeDataSchemasMapping(sourceCode)

  console.log(`Found ${dataSchemas.length} data schemas`)
  console.log(`Found ${eventTypes.length} event types`)
  console.log(`Found ${Object.keys(mapping).length} mappings`)

  // Generate documentation
  const documentation = generateDocumentation(VERSION, dataSchemas, eventTypes, mapping)

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Write output file
  fs.writeFileSync(OUTPUT_FILE, documentation)

  console.log(`Generated ${OUTPUT_FILE}`)
  console.log(`Version: ${VERSION}`)
}

main()
