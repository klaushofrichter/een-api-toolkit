[**EEN API Toolkit v0.3.96**](../README.md)

***

[EEN API Toolkit](../README.md) / getEventAlertConditionRuleFieldValues

# Function: getEventAlertConditionRuleFieldValues()

> **getEventAlertConditionRuleFieldValues**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventAlertConditionRuleFieldValues`](../interfaces/EventAlertConditionRuleFieldValues.md)\>\>

Defined in: [automations/service.ts:147](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/automations/service.ts#L147)

Get available field values for event alert condition rules.

## Parameters

### params?

[`GetEventAlertConditionRuleFieldValuesParams`](../interfaces/GetEventAlertConditionRuleFieldValuesParams.md)

Optional filter parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventAlertConditionRuleFieldValues`](../interfaces/EventAlertConditionRuleFieldValues.md)\>\>

A Result containing field values or an error

## Remarks

Fetches available values that can be used for filtering event alert condition rules.
Useful for building filter UI components.

## Example

```typescript
import { getEventAlertConditionRuleFieldValues } from 'een-api-toolkit'

const { data, error } = await getEventAlertConditionRuleFieldValues()
if (data) {
  console.log('Available event types:', data.eventTypes)
  console.log('Available alert types:', data.outputAlertTypes)
}
```
