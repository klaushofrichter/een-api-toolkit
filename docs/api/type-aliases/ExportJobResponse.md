[**EEN API Toolkit v0.3.86**](../README.md)

***

[EEN API Toolkit](../README.md) / ExportJobResponse

# Type Alias: ExportJobResponse

> **ExportJobResponse** = [`Job`](../interfaces/Job.md)

Defined in: [types/export.ts:83](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/export.ts#L83)

Response from creating an export job.

## Remarks

Returns the created job with its initial state. Use `getJob()` to poll
for completion.
