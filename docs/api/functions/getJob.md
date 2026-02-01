[**EEN API Toolkit v0.3.48**](../README.md)

***

[EEN API Toolkit](../README.md) / getJob

# Function: getJob()

> **getJob**(`jobId`, `params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Job`](../interfaces/Job.md)\>\>

Defined in: [src/jobs/service.ts:159](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/jobs/service.ts#L159)

Get a specific job by ID.

## Parameters

### jobId

`string`

The unique identifier of the job to fetch

### params?

[`GetJobParams`](../interfaces/GetJobParams.md)

Optional parameters (e.g., include additional fields)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Job`](../interfaces/Job.md)\>\>

A Result containing the job or an error

## Remarks

Fetches a single job from `/api/v3.0/jobs/{jobId}`. Use this to poll
for job completion after creating an export.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getjob).

## Example

```typescript
import { getJob } from 'een-api-toolkit'

const { data, error } = await getJob('job-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Job not found')
  }
  return
}

console.log(`Job state: ${data.state}`)
if (data.state === 'started') {
  console.log(`Progress: ${data.progress}%`)
}
if (data.state === 'success') {
  console.log(`File ID: ${data.fileId}`)
}
```
