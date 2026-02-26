[**EEN API Toolkit v0.3.102**](../README.md)

***

[EEN API Toolkit](../README.md) / AlertActionRule

# Interface: AlertActionRule

Defined in: [types/automation.ts:237](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L237)

Alert Action Rule entity from EEN API v3.0.

## Remarks

Connects alerts to actions. When an alert matches the rule's criteria,
the associated alert actions are executed.

## Example

```typescript
import { listAlertActionRules, type AlertActionRule } from 'een-api-toolkit'

const { data, error } = await listAlertActionRules({
  enabled: true,
  pageSize: 20
})
```

## Properties

### id

> **id**: `string`

Defined in: [types/automation.ts:239](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L239)

Unique identifier

***

### createTimestamp

> **createTimestamp**: `string`

Defined in: [types/automation.ts:241](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L241)

ISO 8601 timestamp when created

***

### name

> **name**: `string`

Defined in: [types/automation.ts:243](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L243)

Human-readable name

***

### notes?

> `optional` **notes**: `string`

Defined in: [types/automation.ts:245](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L245)

Optional notes about the rule

***

### enabled

> **enabled**: `boolean`

Defined in: [types/automation.ts:247](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L247)

Whether the rule is enabled

***

### alertTypes

> **alertTypes**: `string`[]

Defined in: [types/automation.ts:249](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L249)

Alert types this rule applies to

***

### actorIds

> **actorIds**: `string`[]

Defined in: [types/automation.ts:251](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L251)

Actor IDs this rule applies to

***

### actorTypes

> **actorTypes**: `string`[]

Defined in: [types/automation.ts:253](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L253)

Actor types this rule applies to

***

### ruleIds

> **ruleIds**: `string`[]

Defined in: [types/automation.ts:255](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L255)

Alert condition rule IDs this rule applies to

***

### alertActionIds

> **alertActionIds**: `string`[]

Defined in: [types/automation.ts:257](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L257)

Alert action IDs to execute when rule matches

***

### priority\_\_gte?

> `optional` **priority\_\_gte**: `number`

Defined in: [types/automation.ts:259](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L259)

Minimum priority for alerts (inclusive)

***

### priority\_\_lte?

> `optional` **priority\_\_lte**: `number`

Defined in: [types/automation.ts:261](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L261)

Maximum priority for alerts (inclusive)
