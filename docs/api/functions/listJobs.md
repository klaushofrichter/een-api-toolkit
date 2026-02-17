[**EEN API Toolkit v0.3.84**](../README.md)

***

[EEN API Toolkit](../README.md) / listJobs

# Function: listJobs()

> **listJobs**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Job`](../interfaces/Job.md)\>\>\>

Defined in: [jobs/service.ts:43](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/jobs/service.ts#L43)

List jobs with optional pagination and filtering.

## Parameters

### params?

[`ListJobsParams`](../interfaces/ListJobsParams.md)

Optional pagination and filtering parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Job`](../interfaces/Job.md)\>\>\>

A Result containing a paginated list of jobs or an error

## Remarks

Fetches a paginated list of jobs from `/api/v3.0/jobs`. Supports
filtering by state, type, and time range.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listjobs).

## Example

```typescript
import { listJobs } from 'een-api-toolkit'

// Basic usage
const { data, error } = await listJobs()
if (data) {
  console.log(`Found ${data.results.length} jobs`)
}

// Filter by state
const { data } = await listJobs({
  state__in: ['pending', 'started'],
  pageSize: 50
})

// Get export jobs only
const { data: exports } = await listJobs({
  type: 'export'
})
```
