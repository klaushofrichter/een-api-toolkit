[**EEN API Toolkit v0.3.48**](../README.md)

***

[EEN API Toolkit](../README.md) / GetJobParams

# Interface: GetJobParams

Defined in: [src/types/job.ts:222](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L222)

Parameters for getting a single job.

## Remarks

Use to fetch a specific job by ID, typically for polling job status.

## Example

```typescript
import { getJob } from 'een-api-toolkit'

// Poll for job completion
const { data, error } = await getJob('job-123')
if (data?.state === 'success') {
  console.log('Job completed! File:', data.fileId)
}
```

## Properties

### include?

> `optional` **include**: `string`[]

Defined in: [src/types/job.ts:224](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L224)

Additional fields to include in the response
