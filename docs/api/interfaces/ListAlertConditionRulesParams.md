[**EEN API Toolkit v0.3.64**](../README.md)

***

[EEN API Toolkit](../README.md) / ListAlertConditionRulesParams

# Interface: ListAlertConditionRulesParams

Defined in: [src/types/automation.ts:506](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L506)

Parameters for listing alert condition rules.

## Example

```typescript
const { data } = await listAlertConditionRules({
  enabled: true,
  include: ['actions', 'insights']
})
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [src/types/automation.ts:508](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L508)

Number of results per page

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/automation.ts:510](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L510)

Token for fetching a specific page

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/types/automation.ts:512](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L512)

Filter by enabled status

***

### id\_\_in?

> `optional` **id\_\_in**: `string`[]

Defined in: [src/types/automation.ts:514](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L514)

Filter by rule IDs

***

### actorId\_\_in?

> `optional` **actorId\_\_in**: `string`[]

Defined in: [src/types/automation.ts:516](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L516)

Filter by actor IDs

***

### inputEventType\_\_in?

> `optional` **inputEventType\_\_in**: `string`[]

Defined in: [src/types/automation.ts:518](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L518)

Filter by input event types

***

### outputAlertType?

> `optional` **outputAlertType**: `string`

Defined in: [src/types/automation.ts:520](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L520)

Filter by output alert type

***

### type?

> `optional` **type**: `string`

Defined in: [src/types/automation.ts:522](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L522)

Filter by rule type

***

### include?

> `optional` **include**: [`AlertConditionRuleInclude`](../type-aliases/AlertConditionRuleInclude.md)[]

Defined in: [src/types/automation.ts:524](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L524)

Fields to include in response
