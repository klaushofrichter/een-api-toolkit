[**EEN API Toolkit v0.3.68**](../README.md)

***

[EEN API Toolkit](../README.md) / listAlertConditionRules

# Function: listAlertConditionRules()

> **listAlertConditionRules**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`AlertConditionRule`](../interfaces/AlertConditionRule.md)\>\>\>

Defined in: [src/automations/service.ts:295](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/automations/service.ts#L295)

List alert condition rules with optional filters and pagination.

## Parameters

### params?

[`ListAlertConditionRulesParams`](../interfaces/ListAlertConditionRulesParams.md)

Optional filtering and pagination parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`AlertConditionRule`](../interfaces/AlertConditionRule.md)\>\>\>

A Result containing a paginated list of rules or an error

## Remarks

Fetches a paginated list of alert condition rules from
`/api/v3.0/alertConditionRules`. These rules process events and create alerts.

## Example

```typescript
import { listAlertConditionRules } from 'een-api-toolkit'

// Get enabled rules with actions
const { data, error } = await listAlertConditionRules({
  enabled: true,
  include: ['actions', 'insights']
})

if (data) {
  data.results.forEach(rule => {
    console.log(`${rule.name}: ${rule.inputEventTypes.length} event types`)
  })
}
```
