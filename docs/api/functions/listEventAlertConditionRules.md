[**EEN API Toolkit v0.3.102**](../README.md)

***

[EEN API Toolkit](../README.md) / listEventAlertConditionRules

# Function: listEventAlertConditionRules()

> **listEventAlertConditionRules**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`EventAlertConditionRule`](../interfaces/EventAlertConditionRule.md)\>\>\>

Defined in: [automations/service.ts:58](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/automations/service.ts#L58)

List event alert condition rules with optional filters and pagination.

## Parameters

### params?

[`ListEventAlertConditionRulesParams`](../interfaces/ListEventAlertConditionRulesParams.md)

Optional filtering and pagination parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`EventAlertConditionRule`](../interfaces/EventAlertConditionRule.md)\>\>\>

A Result containing a paginated list of rules or an error

## Remarks

Fetches a paginated list of event alert condition rules from
`/api/v3.0/eventAlertConditionRules`. These rules define conditions
under which events trigger alerts.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listalertconditionrules).

## Example

```typescript
import { listEventAlertConditionRules } from 'een-api-toolkit'

// Get enabled rules
const { data, error } = await listEventAlertConditionRules({
  enabled: true,
  pageSize: 50
})

if (data) {
  console.log(`Found ${data.results.length} rules`)
  data.results.forEach(rule => {
    console.log(`${rule.name}: priority ${rule.priority}`)
  })
}
```
