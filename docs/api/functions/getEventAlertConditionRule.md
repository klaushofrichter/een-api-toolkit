[**EEN API Toolkit v0.3.78**](../README.md)

***

[EEN API Toolkit](../README.md) / getEventAlertConditionRule

# Function: getEventAlertConditionRule()

> **getEventAlertConditionRule**(`ruleId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventAlertConditionRule`](../interfaces/EventAlertConditionRule.md)\>\>

Defined in: [automations/service.ts:220](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/automations/service.ts#L220)

Get a specific event alert condition rule by ID.

## Parameters

### ruleId

`string`

The unique identifier of the rule to fetch

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventAlertConditionRule`](../interfaces/EventAlertConditionRule.md)\>\>

A Result containing the rule or an error

## Remarks

Fetches a single event alert condition rule from
`/api/v3.0/eventAlertConditionRules/{id}`.

## Example

```typescript
import { getEventAlertConditionRule } from 'een-api-toolkit'

const { data, error } = await getEventAlertConditionRule('rule-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Rule not found')
  }
  return
}

console.log(`Rule: ${data.name}, Priority: ${data.priority}`)
```
