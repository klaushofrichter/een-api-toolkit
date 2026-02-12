[**EEN API Toolkit v0.3.75**](../README.md)

***

[EEN API Toolkit](../README.md) / GetJobParams

# Interface: GetJobParams

Defined in: [types/job.ts:224](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L224)

Parameters for getting a single job.

## Remarks

Use to fetch a specific job by ID, typically for polling job status.

## Example

```typescript
import { getJob } from 'een-api-toolkit'

// Poll for job completion
const { data, error } = await getJob('job-123')
if (data?.state === 'success') {
  const fileUrl = data.result?.intervals?.[0]?.files?.[0]?.url
  const fileId = fileUrl?.substring(fileUrl.lastIndexOf('/') + 1)
  console.log('Job completed! File ID:', fileId)
}
```

## Properties

### include?

> `optional` **include**: `string`[]

Defined in: [types/job.ts:226](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L226)

Additional fields to include in the response
