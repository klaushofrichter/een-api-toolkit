[**EEN API Toolkit v0.3.77**](../README.md)

***

[EEN API Toolkit](../README.md) / Job

# Interface: Job

Defined in: [types/job.ts:127](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L127)

Job entity from EEN API v3.0.

## Remarks

Represents an asynchronous job in the Eagle Eye Networks platform.
Jobs are used for long-running operations like video exports.

Note: Some fields like name and timestamps are nested in the `arguments`
and `result` objects. Use helper properties or access them directly:
- Name: `job.arguments?.originalRequest?.name`
- Request timestamps: `job.arguments?.originalRequest?.startTimestamp/endTimestamp`
- Result files: `job.result?.intervals?.[0]?.files`

## Example

```typescript
import { listJobs, type Job } from 'een-api-toolkit'

const { data, error } = await listJobs({ state__in: ['pending', 'started'] })
if (data) {
  data.results.forEach((job: Job) => {
    const name = job.arguments?.originalRequest?.name || job.id
    console.log(`${name}: ${job.state}`)
  })
}
```

## Properties

### id

> **id**: `string`

Defined in: [types/job.ts:129](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L129)

Unique identifier for the job

***

### namespace?

> `optional` **namespace**: `string`

Defined in: [types/job.ts:131](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L131)

Namespace of the job (e.g., 'media')

***

### type

> **type**: `string`

Defined in: [types/job.ts:133](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L133)

Type of job (e.g., 'media.export')

***

### userId

> **userId**: `string`

Defined in: [types/job.ts:135](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L135)

ID of the user who created the job

***

### state

> **state**: [`JobState`](../type-aliases/JobState.md)

Defined in: [types/job.ts:137](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L137)

Current state of the job

***

### detailedState?

> `optional` **detailedState**: `string` \| `null`

Defined in: [types/job.ts:139](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L139)

Detailed state information

***

### progress?

> `optional` **progress**: `number`

Defined in: [types/job.ts:141](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L141)

Progress as a decimal (0-1). Multiply by 100 for percentage.

***

### error?

> `optional` **error**: `string` \| `null`

Defined in: [types/job.ts:143](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L143)

Error details if the job failed

***

### arguments?

> `optional` **arguments**: `JobArguments`

Defined in: [types/job.ts:145](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L145)

Job arguments including the original request

***

### result?

> `optional` **result**: `JobResult`

Defined in: [types/job.ts:147](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L147)

Job result including output files

***

### createTimestamp

> **createTimestamp**: `string`

Defined in: [types/job.ts:149](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L149)

ISO 8601 timestamp when the job was created

***

### updateTimestamp?

> `optional` **updateTimestamp**: `string`

Defined in: [types/job.ts:151](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L151)

ISO 8601 timestamp when the job was last updated

***

### expireTimestamp?

> `optional` **expireTimestamp**: `string`

Defined in: [types/job.ts:153](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L153)

ISO 8601 timestamp when the job is scheduled to expire

***

### scheduleTimestamp?

> `optional` **scheduleTimestamp**: `string` \| `null`

Defined in: [types/job.ts:155](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/job.ts#L155)

ISO 8601 timestamp when the job is scheduled to run
