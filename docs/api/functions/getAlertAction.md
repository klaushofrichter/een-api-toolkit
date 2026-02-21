[**EEN API Toolkit v0.3.89**](../README.md)

***

[EEN API Toolkit](../README.md) / getAlertAction

# Function: getAlertAction()

> **getAlertAction**(`actionId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`AutomationAlertAction`](../interfaces/AutomationAlertAction.md)\>\>

Defined in: [automations/service.ts:732](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/automations/service.ts#L732)

Get a specific alert action by ID.

## Parameters

### actionId

`string`

The unique identifier of the action to fetch

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`AutomationAlertAction`](../interfaces/AutomationAlertAction.md)\>\>

A Result containing the action or an error

## Remarks

Fetches a single alert action from `/api/v3.0/alertActions/{id}`.

## Example

```typescript
import { getAlertAction } from 'een-api-toolkit'

const { data, error } = await getAlertAction('action-123')

if (data) {
  console.log(`Action: ${data.name} (${data.type})`)
  console.log('Settings:', data.settings)
}
```
