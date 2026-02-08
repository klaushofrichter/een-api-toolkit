[**EEN API Toolkit v0.3.65**](../README.md)

***

[EEN API Toolkit](../README.md) / deleteJob

# Function: deleteJob()

> **deleteJob**(`jobId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

Defined in: [src/jobs/service.ts:245](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/jobs/service.ts#L245)

Delete (revoke) a job by ID.

## Parameters

### jobId

`string`

The unique identifier of the job to delete

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

A Result with void data on success, or an error

## Remarks

Deletes a job from `/api/v3.0/jobs/{jobId}` regardless of its state.
This can be used to:
- Cancel a **pending** job before it starts processing
- Revoke a **started** job to stop processing
- Remove a **completed** job record

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/deletejob).

## Example

```typescript
import { deleteJob } from 'een-api-toolkit'

// Cancel a pending export job
const { error } = await deleteJob('job-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Job not found or already deleted')
  } else {
    console.error('Failed to delete job:', error.message)
  }
  return
}

console.log('Job successfully revoked')
```
