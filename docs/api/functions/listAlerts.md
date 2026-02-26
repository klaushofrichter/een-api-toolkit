[**EEN API Toolkit v0.3.103**](../README.md)

***

[EEN API Toolkit](../README.md) / listAlerts

# Function: listAlerts()

> **listAlerts**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Alert`](../interfaces/Alert.md)\>\>\>

Defined in: [alerts/service.ts:63](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/alerts/service.ts#L63)

List alerts with optional filters and pagination.

## Parameters

### params?

[`ListAlertsParams`](../interfaces/ListAlertsParams.md)

Optional filtering and pagination parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Alert`](../interfaces/Alert.md)\>\>\>

A Result containing a paginated list of alerts or an error

## Remarks

Fetches a paginated list of alerts from `/api/v3.0/alerts`. Supports various
filters including time range, actor, alert type, priority, and more.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listalerts).

## Example

```typescript
import { listAlerts } from 'een-api-toolkit'

// Get recent alerts from a specific camera
const { data, error } = await listAlerts({
  actorId__in: ['100d4c41'],
  timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
  pageSize: 50,
  include: ['data', 'actions']
})

if (data) {
  console.log(`Found ${data.results.length} alerts`)
  data.results.forEach(alert => {
    console.log(`${alert.alertType} at ${alert.timestamp}`)
  })
}

// Fetch all alerts with pagination
let allAlerts: Alert[] = []
let pageToken: string | undefined
do {
  const { data, error } = await listAlerts({
    timestamp__gte: new Date(Date.now() - 86400000).toISOString(),
    pageSize: 100,
    pageToken
  })
  if (error) break
  allAlerts.push(...data.results)
  pageToken = data.nextPageToken
} while (pageToken)
```
