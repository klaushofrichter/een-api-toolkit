[**EEN API Toolkit v0.3.69**](../README.md)

***

[EEN API Toolkit](../README.md) / listAlertTypes

# Function: listAlertTypes()

> **listAlertTypes**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`AlertType`](../interfaces/AlertType.md)\>\>\>

Defined in: [src/alerts/service.ts:295](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/alerts/service.ts#L295)

List all available alert types.

## Parameters

### params?

[`ListAlertTypesParams`](../interfaces/ListAlertTypesParams.md)

Optional pagination parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`AlertType`](../interfaces/AlertType.md)\>\>\>

A Result containing a paginated list of alert types or an error

## Remarks

Fetches a paginated list of alert types from `/api/v3.0/alertTypes`. Alert types
describe the different kinds of alerts that can be generated in the system.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listalerttypes).

## Example

```typescript
import { listAlertTypes } from 'een-api-toolkit'

const { data, error } = await listAlertTypes()
if (data) {
  data.results.forEach(alertType => {
    console.log(`${alertType.type}: ${alertType.description}`)
  })
}

// With pagination
const { data: pagedTypes } = await listAlertTypes({ pageSize: 20 })
```
