[**EEN API Toolkit v0.3.55**](../README.md)

***

[EEN API Toolkit](../README.md) / CreateExportParams

# Interface: CreateExportParams

Defined in: [src/types/export.ts:47](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L47)

Parameters for creating an export job.

## Remarks

Creates an asynchronous job that exports video or images from a camera.
The job progresses through states: pending → started → success/failure.

## Example

```typescript
import { createExportJob, formatTimestamp } from 'een-api-toolkit'

const startTime = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
const endTime = new Date()

const { data, error } = await createExportJob({
  name: 'Security Incident Export',
  type: 'video',
  cameraId: 'camera-123',
  startTimestamp: formatTimestamp(startTime.toISOString()),
  endTimestamp: formatTimestamp(endTime.toISOString())
})

if (data) {
  console.log('Export job created:', data.id)
  // Poll getJob() to track progress
}
```

## Properties

### name?

> `optional` **name**: `string`

Defined in: [src/types/export.ts:49](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L49)

Display name for the export job

***

### type

> **type**: [`ExportType`](../type-aliases/ExportType.md)

Defined in: [src/types/export.ts:51](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L51)

Type of export to create

***

### cameraId

> **cameraId**: `string`

Defined in: [src/types/export.ts:53](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L53)

Camera ID to export from

***

### startTimestamp

> **startTimestamp**: `string`

Defined in: [src/types/export.ts:55](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L55)

Start timestamp for the export (ISO 8601 format with +00:00 timezone)

***

### endTimestamp

> **endTimestamp**: `string`

Defined in: [src/types/export.ts:57](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L57)

End timestamp for the export (ISO 8601 format with +00:00 timezone)

***

### playbackMultiplier?

> `optional` **playbackMultiplier**: `number`

Defined in: [src/types/export.ts:63](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L63)

Playback multiplier for time lapse video (required for timeLapse and bundle types).
Value must be between 1 and 48.
For example, a value of 10 means 10 minutes of recording becomes 1 minute of playback.

***

### autoDelete?

> `optional` **autoDelete**: `boolean`

Defined in: [src/types/export.ts:65](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L65)

If true, export is auto-deleted after 2 weeks (default: false)

***

### directory?

> `optional` **directory**: `string`

Defined in: [src/types/export.ts:67](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L67)

Directory path in archive to save the export (default: '/')

***

### notes?

> `optional` **notes**: `string`

Defined in: [src/types/export.ts:69](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L69)

Notes/description for the export

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/export.ts:71](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L71)

Tags for categorization
