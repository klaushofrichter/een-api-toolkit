[**EEN API Toolkit v0.3.100**](../README.md)

***

[EEN API Toolkit](../README.md) / ListFilesParams

# Interface: ListFilesParams

Defined in: [types/file.ts:135](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L135)

Parameters for listing files.

## Remarks

Supports filtering by type, camera, and time range.

## Example

```typescript
import { listFiles } from 'een-api-toolkit'

// Get export files
const { data } = await listFiles({
  type__in: ['export'],
  pageSize: 50
})

// Get files for a specific camera
const { data: cameraFiles } = await listFiles({
  cameraId: 'camera-123'
})
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [types/file.ts:137](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L137)

Number of results per page (default: 100, max: 1000)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [types/file.ts:139](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L139)

Token for fetching a specific page

***

### include?

> `optional` **include**: [`FileIncludeField`](../type-aliases/FileIncludeField.md)[]

Defined in: [types/file.ts:145](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L145)

Additional fields to include in the response.
Valid values: accountId, publicShare, notes, createTimestamp,
updateTimestamp, size, metadata, tags, childCount, details

***

### type\_\_in?

> `optional` **type\_\_in**: [`FileType`](../type-aliases/FileType.md)[]

Defined in: [types/file.ts:147](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L147)

Filter by file types (any match)

***

### cameraId?

> `optional` **cameraId**: `string`

Defined in: [types/file.ts:149](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L149)

Filter by camera ID

***

### cameraId\_\_in?

> `optional` **cameraId\_\_in**: `string`[]

Defined in: [types/file.ts:151](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L151)

Filter by camera IDs (any match)

***

### jobId?

> `optional` **jobId**: `string`

Defined in: [types/file.ts:153](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L153)

Filter by job ID

***

### createTimestamp\_\_gte?

> `optional` **createTimestamp\_\_gte**: `string`

Defined in: [types/file.ts:155](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L155)

Filter by files created after this timestamp (ISO 8601)

***

### createTimestamp\_\_lte?

> `optional` **createTimestamp\_\_lte**: `string`

Defined in: [types/file.ts:157](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L157)

Filter by files created before this timestamp (ISO 8601)

***

### tags\_\_contains?

> `optional` **tags\_\_contains**: `string`[]

Defined in: [types/file.ts:159](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L159)

Filter by tags (all must match)

***

### q?

> `optional` **q**: `string`

Defined in: [types/file.ts:161](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L161)

Full-text search query

***

### sort?

> `optional` **sort**: `string`[]

Defined in: [types/file.ts:163](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L163)

Fields to sort by (prefix with - for descending)
