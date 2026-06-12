[**EEN API Toolkit v0.3.106**](../README.md)

***

[EEN API Toolkit](../README.md) / getAlertActionRule

# Function: getAlertActionRule()

> **getAlertActionRule**(`ruleId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`AlertActionRule`](../interfaces/AlertActionRule.md)\>\>

Defined in: [automations/service.ts:519](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/automations/service.ts#L519)

Get a specific alert action rule by ID.

## Parameters

### ruleId

`string`

The unique identifier of the rule to fetch

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`AlertActionRule`](../interfaces/AlertActionRule.md)\>\>

A Result containing the rule or an error

## Remarks

Fetches a single alert action rule from `/api/v3.0/alertActionRules/{id}`.

## Example

```typescript
import { getAlertActionRule } from 'een-api-toolkit'

const { data, error } = await getAlertActionRule('rule-123')

if (data) {
  console.log(`Rule: ${data.name}`)
  console.log(`Alert types: ${data.alertTypes.join(', ')}`)
  console.log(`Actions: ${data.alertActionIds.length}`)
}
```
