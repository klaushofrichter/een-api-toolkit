[**EEN API Toolkit v0.3.79**](../README.md)

***

[EEN API Toolkit](../README.md) / ListEventAlertConditionRulesParams

# Interface: ListEventAlertConditionRulesParams

Defined in: [types/automation.ts:459](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L459)

Parameters for listing event alert condition rules.

## Example

```typescript
const { data } = await listEventAlertConditionRules({
  enabled: true,
  pageSize: 50,
  outputAlertType__in: ['een.motionDetectionAlert.v1']
})
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [types/automation.ts:461](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L461)

Number of results per page

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [types/automation.ts:463](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L463)

Token for fetching a specific page

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [types/automation.ts:465](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L465)

Filter by enabled status

***

### id\_\_in?

> `optional` **id\_\_in**: `string`[]

Defined in: [types/automation.ts:467](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L467)

Filter by rule IDs

***

### outputAlertType\_\_in?

> `optional` **outputAlertType\_\_in**: `string`[]

Defined in: [types/automation.ts:469](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L469)

Filter by output alert types

***

### priority\_\_gte?

> `optional` **priority\_\_gte**: `number`

Defined in: [types/automation.ts:471](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L471)

Filter by minimum priority (inclusive)

***

### priority\_\_lte?

> `optional` **priority\_\_lte**: `number`

Defined in: [types/automation.ts:473](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L473)

Filter by maximum priority (inclusive)
