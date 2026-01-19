[**EEN API Toolkit v0.3.19**](../README.md)

***

[EEN API Toolkit](../README.md) / getAlert

# Function: getAlert()

> **getAlert**(`alertId`, `params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Alert`](../interfaces/Alert.md)\>\>

Defined in: [src/alerts/service.ts:218](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/alerts/service.ts#L218)

Get a specific alert by ID.

## Parameters

### alertId

`string`

The unique identifier of the alert to fetch

### params?

[`GetAlertParams`](../interfaces/GetAlertParams.md)

Optional parameters (e.g., include additional fields)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Alert`](../interfaces/Alert.md)\>\>

A Result containing the alert or an error

## Remarks

Fetches a single alert from `/api/v3.0/alerts/{alertId}`. Use the `include`
parameter to request additional fields.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getalert).

## Example

```typescript
import { getAlert } from 'een-api-toolkit'

const { data, error } = await getAlert('alert-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Alert not found')
  }
  return
}

console.log(`Alert: ${data.alertType} at ${data.timestamp}`)

// With additional fields
const { data: alertWithData } = await getAlert('alert-123', {
  include: ['data', 'actions', 'description']
})
```
