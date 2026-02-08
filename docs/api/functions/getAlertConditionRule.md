[**EEN API Toolkit v0.3.66**](../README.md)

***

[EEN API Toolkit](../README.md) / getAlertConditionRule

# Function: getAlertConditionRule()

> **getAlertConditionRule**(`ruleId`, `params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`AlertConditionRule`](../interfaces/AlertConditionRule.md)\>\>

Defined in: [src/automations/service.ts:396](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/automations/service.ts#L396)

Get a specific alert condition rule by ID.

## Parameters

### ruleId

`string`

The unique identifier of the rule to fetch

### params?

[`GetAlertConditionRuleParams`](../interfaces/GetAlertConditionRuleParams.md)

Optional parameters (e.g., include additional fields)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`AlertConditionRule`](../interfaces/AlertConditionRule.md)\>\>

A Result containing the rule or an error

## Remarks

Fetches a single alert condition rule from `/api/v3.0/alertConditionRules/{id}`.
Use the `include` parameter to request additional fields like actions or insights.

## Example

```typescript
import { getAlertConditionRule } from 'een-api-toolkit'

const { data, error } = await getAlertConditionRule('rule-123', {
  include: ['actions', 'insights']
})

if (data) {
  console.log(`Rule: ${data.name}`)
  console.log(`Actions: ${data.actions?.length ?? 0}`)
}
```
