[**EEN API Toolkit v0.3.58**](../README.md)

***

[EEN API Toolkit](../README.md) / listAlertActionRules

# Function: listAlertActionRules()

> **listAlertActionRules**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`AlertActionRule`](../interfaces/AlertActionRule.md)\>\>\>

Defined in: [src/automations/service.ts:480](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/automations/service.ts#L480)

List alert action rules with optional filters and pagination.

## Parameters

### params?

[`ListAlertActionRulesParams`](../interfaces/ListAlertActionRulesParams.md)

Optional filtering and pagination parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`AlertActionRule`](../interfaces/AlertActionRule.md)\>\>\>

A Result containing a paginated list of rules or an error

## Remarks

Fetches a paginated list of alert action rules from `/api/v3.0/alertActionRules`.
These rules connect alerts to actions - when an alert matches the rule's criteria,
the associated actions are executed.

## Example

```typescript
import { listAlertActionRules } from 'een-api-toolkit'

// Get enabled rules for specific alert types
const { data, error } = await listAlertActionRules({
  enabled: true,
  alertType__in: ['een.motionDetectionAlert.v1']
})

if (data) {
  data.results.forEach(rule => {
    console.log(`${rule.name}: ${rule.alertActionIds.length} actions`)
  })
}
```
