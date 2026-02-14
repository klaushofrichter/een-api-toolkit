[**EEN API Toolkit v0.3.79**](../README.md)

***

[EEN API Toolkit](../README.md) / ListDownloadsParams

# Interface: ListDownloadsParams

Defined in: [types/download.ts:82](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L82)

Parameters for listing downloads.

## Remarks

Supports filtering by status, camera, and time range.

## Example

```typescript
import { listDownloads } from 'een-api-toolkit'

// Get available downloads
const { data } = await listDownloads({
  status__in: ['available'],
  pageSize: 50
})
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [types/download.ts:84](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L84)

Number of results per page (default: 100, max: 1000)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [types/download.ts:86](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L86)

Token for fetching a specific page

***

### status\_\_in?

> `optional` **status\_\_in**: [`DownloadStatus`](../type-aliases/DownloadStatus.md)[]

Defined in: [types/download.ts:88](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L88)

Filter by download status (any match)

***

### cameraId?

> `optional` **cameraId**: `string`

Defined in: [types/download.ts:90](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L90)

Filter by camera ID

***

### cameraId\_\_in?

> `optional` **cameraId\_\_in**: `string`[]

Defined in: [types/download.ts:92](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L92)

Filter by camera IDs (any match)

***

### jobId?

> `optional` **jobId**: `string`

Defined in: [types/download.ts:94](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L94)

Filter by job ID

***

### fileId?

> `optional` **fileId**: `string`

Defined in: [types/download.ts:96](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L96)

Filter by file ID

***

### createTimestamp\_\_gte?

> `optional` **createTimestamp\_\_gte**: `string`

Defined in: [types/download.ts:98](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L98)

Filter by downloads created after this timestamp (ISO 8601)

***

### createTimestamp\_\_lte?

> `optional` **createTimestamp\_\_lte**: `string`

Defined in: [types/download.ts:100](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L100)

Filter by downloads created before this timestamp (ISO 8601)

***

### q?

> `optional` **q**: `string`

Defined in: [types/download.ts:102](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L102)

Full-text search query

***

### sort?

> `optional` **sort**: `string`[]

Defined in: [types/download.ts:104](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L104)

Fields to sort by (prefix with - for descending)
