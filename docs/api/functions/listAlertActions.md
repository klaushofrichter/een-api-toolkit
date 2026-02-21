[**EEN API Toolkit v0.3.86**](../README.md)

***

[EEN API Toolkit](../README.md) / listAlertActions

# Function: listAlertActions()

> **listAlertActions**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`AutomationAlertAction`](../interfaces/AutomationAlertAction.md)\>\>\>

Defined in: [automations/service.ts:649](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/automations/service.ts#L649)

List alert actions with optional filters and pagination.

## Parameters

### params?

[`ListAlertActionsParams`](../interfaces/ListAlertActionsParams.md)

Optional filtering and pagination parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`AutomationAlertAction`](../interfaces/AutomationAlertAction.md)\>\>\>

A Result containing a paginated list of actions or an error

## Remarks

Fetches a paginated list of alert actions from `/api/v3.0/alertActions`.
Alert actions define what happens when an alert is triggered (notifications,
webhooks, integrations, etc.).

## Example

```typescript
import { listAlertActions } from 'een-api-toolkit'

// Get enabled webhook and notification actions
const { data, error } = await listAlertActions({
  enabled: true,
  type__in: ['notification', 'webhook']
})

if (data) {
  data.results.forEach(action => {
    console.log(`${action.name} (${action.type})`)
  })
}
```
