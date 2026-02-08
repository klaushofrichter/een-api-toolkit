[**EEN API Toolkit v0.3.67**](../README.md)

***

[EEN API Toolkit](../README.md) / ListAlertActionRulesParams

# Interface: ListAlertActionRulesParams

Defined in: [src/types/automation.ts:550](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L550)

Parameters for listing alert action rules.

## Example

```typescript
const { data } = await listAlertActionRules({
  enabled: true,
  alertType__in: ['een.motionDetectionAlert.v1']
})
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [src/types/automation.ts:552](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L552)

Number of results per page

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/automation.ts:554](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L554)

Token for fetching a specific page

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/types/automation.ts:556](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L556)

Filter by enabled status

***

### id\_\_in?

> `optional` **id\_\_in**: `string`[]

Defined in: [src/types/automation.ts:558](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L558)

Filter by rule IDs

***

### alertType\_\_in?

> `optional` **alertType\_\_in**: `string`[]

Defined in: [src/types/automation.ts:560](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L560)

Filter by alert types

***

### actorId\_\_in?

> `optional` **actorId\_\_in**: `string`[]

Defined in: [src/types/automation.ts:562](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L562)

Filter by actor IDs

***

### alertActionId\_\_in?

> `optional` **alertActionId\_\_in**: `string`[]

Defined in: [src/types/automation.ts:564](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L564)

Filter by alert action IDs

***

### ruleId\_\_in?

> `optional` **ruleId\_\_in**: `string`[]

Defined in: [src/types/automation.ts:566](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L566)

Filter by alert condition rule IDs
