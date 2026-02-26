[**EEN API Toolkit v0.3.103**](../README.md)

***

[EEN API Toolkit](../README.md) / AutomationAlertAction

# Interface: AutomationAlertAction

Defined in: [types/automation.ts:424](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L424)

Alert Action entity from EEN API v3.0.

## Remarks

Represents an action that can be executed when an alert is triggered.
Actions include notifications, webhooks, integrations, and physical outputs.

## Example

```typescript
import { listAlertActions, type AlertAction } from 'een-api-toolkit'

const { data, error } = await listAlertActions({ enabled: true })
if (data) {
  data.results.forEach((action) => {
    console.log(`Action: ${action.name} (${action.type})`)
  })
}
```

## Properties

### id

> **id**: `string`

Defined in: [types/automation.ts:426](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L426)

Unique identifier

***

### createTimestamp

> **createTimestamp**: `string`

Defined in: [types/automation.ts:428](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L428)

ISO 8601 timestamp when created

***

### type

> **type**: [`AlertActionType`](../type-aliases/AlertActionType.md)

Defined in: [types/automation.ts:430](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L430)

Action type

***

### name

> **name**: `string`

Defined in: [types/automation.ts:432](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L432)

Human-readable name

***

### notes?

> `optional` **notes**: `string`

Defined in: [types/automation.ts:434](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L434)

Optional notes about the action

***

### enabled

> **enabled**: `boolean`

Defined in: [types/automation.ts:436](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L436)

Whether the action is enabled

***

### settings

> **settings**: [`AlertActionSettings`](../type-aliases/AlertActionSettings.md)

Defined in: [types/automation.ts:438](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L438)

Type-specific settings
