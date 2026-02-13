[**EEN API Toolkit v0.3.77**](../README.md)

***

[EEN API Toolkit](../README.md) / AlertAction

# Interface: AlertAction

Defined in: [types/alert.ts:10](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L10)

Action taken for an alert.

## Remarks

Represents an action that was triggered by an alert, such as sending an email
notification or executing a webhook.

## Properties

### name

> **name**: `string`

Defined in: [types/alert.ts:12](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L12)

Name of the action

***

### type

> **type**: `string`

Defined in: [types/alert.ts:14](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L14)

Type of action (e.g., "email", "webhook", "push")

***

### success

> **success**: `boolean`

Defined in: [types/alert.ts:16](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L16)

Whether the action executed successfully

***

### timestamp

> **timestamp**: `string`

Defined in: [types/alert.ts:18](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L18)

ISO 8601 timestamp when the action was executed

***

### status?

> `optional` **status**: [`AlertActionStatus`](../type-aliases/AlertActionStatus.md)

Defined in: [types/alert.ts:20](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/alert.ts#L20)

Current status of the action
