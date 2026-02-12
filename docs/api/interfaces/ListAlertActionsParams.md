[**EEN API Toolkit v0.3.73**](../README.md)

***

[EEN API Toolkit](../README.md) / ListAlertActionsParams

# Interface: ListAlertActionsParams

Defined in: [types/automation.ts:582](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L582)

Parameters for listing alert actions.

## Example

```typescript
const { data } = await listAlertActions({
  enabled: true,
  type__in: ['notification', 'webhook']
})
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [types/automation.ts:584](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L584)

Number of results per page

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [types/automation.ts:586](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L586)

Token for fetching a specific page

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [types/automation.ts:588](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L588)

Filter by enabled status

***

### id\_\_in?

> `optional` **id\_\_in**: `string`[]

Defined in: [types/automation.ts:590](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L590)

Filter by action IDs

***

### type\_\_in?

> `optional` **type\_\_in**: [`AlertActionType`](../type-aliases/AlertActionType.md)[]

Defined in: [types/automation.ts:592](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L592)

Filter by action types
