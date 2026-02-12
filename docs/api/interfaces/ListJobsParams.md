[**EEN API Toolkit v0.3.76**](../README.md)

***

[EEN API Toolkit](../README.md) / ListJobsParams

# Interface: ListJobsParams

Defined in: [types/job.ts:182](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L182)

Parameters for listing jobs.

## Remarks

Supports filtering by state, type, and time range.

## Example

```typescript
import { listJobs } from 'een-api-toolkit'

// Get pending and started jobs
const { data } = await listJobs({
  state__in: ['pending', 'started'],
  pageSize: 50
})

// Get export jobs
const { data: exports } = await listJobs({
  type: 'export'
})
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [types/job.ts:184](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L184)

Number of results per page (default: 100, max: 1000)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [types/job.ts:186](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L186)

Token for fetching a specific page

***

### state\_\_in?

> `optional` **state\_\_in**: [`JobState`](../type-aliases/JobState.md)[]

Defined in: [types/job.ts:188](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L188)

Filter by job states (any match)

***

### type?

> `optional` **type**: `string`

Defined in: [types/job.ts:190](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L190)

Filter by job type

***

### type\_\_in?

> `optional` **type\_\_in**: `string`[]

Defined in: [types/job.ts:192](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L192)

Filter by job types (any match)

***

### createTimestamp\_\_gte?

> `optional` **createTimestamp\_\_gte**: `string`

Defined in: [types/job.ts:194](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L194)

Filter by jobs created after this timestamp (ISO 8601)

***

### createTimestamp\_\_lte?

> `optional` **createTimestamp\_\_lte**: `string`

Defined in: [types/job.ts:196](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L196)

Filter by jobs created before this timestamp (ISO 8601)

***

### userId?

> `optional` **userId**: `string`

Defined in: [types/job.ts:198](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L198)

Filter by user ID

***

### sort?

> `optional` **sort**: `string`[]

Defined in: [types/job.ts:200](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L200)

Fields to sort by (prefix with - for descending)
