[**EEN API Toolkit v0.3.93**](../README.md)

***

[EEN API Toolkit](../README.md) / createExportJob

# Function: createExportJob()

> **createExportJob**(`params`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Job`](../interfaces/Job.md)\>\>

Defined in: [exports/service.ts:62](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/exports/service.ts#L62)

Create a new export job.

## Parameters

### params

[`CreateExportParams`](../interfaces/CreateExportParams.md)

Export job parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Job`](../interfaces/Job.md)\>\>

A Result containing the created job or an error

## Remarks

Creates an asynchronous job to export video or images from a camera.
The job is queued and processed in the background. Use `getJob()` to
poll for completion.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/createexport).

## Example

```typescript
import { createExportJob, getJob, formatTimestamp } from 'een-api-toolkit'

// Create an export job
const startTime = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
const endTime = new Date()

const { data: job, error } = await createExportJob({
  name: 'Security Incident Export',
  type: 'video',
  cameraId: 'camera-123',
  startTimestamp: formatTimestamp(startTime.toISOString()),
  endTimestamp: formatTimestamp(endTime.toISOString())
})

if (error) {
  console.error('Failed to create export:', error.message)
  return
}

// Poll for completion
let completed = false
while (!completed) {
  await new Promise(r => setTimeout(r, 2000)) // Wait 2 seconds
  const { data: status } = await getJob(job.id)
  if (status?.state === 'success') {
    const fileUrl = status.result?.intervals?.[0]?.files?.[0]?.url
    const fileId = fileUrl?.substring(fileUrl.lastIndexOf('/') + 1)
    console.log('Export complete! File ID:', fileId)
    completed = true
  } else if (status?.state === 'failure') {
    console.error('Export failed:', status.error)
    completed = true
  } else {
    console.log('Progress:', status?.progress || 0, '%')
  }
}
```
