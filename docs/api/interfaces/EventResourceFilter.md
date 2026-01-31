[**EEN API Toolkit v0.3.46**](../README.md)

***

[EEN API Toolkit](../README.md) / EventResourceFilter

# Interface: EventResourceFilter

Defined in: [src/types/automation.ts:32](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L32)

Resource filter for event filtering.

## Properties

### accountIds?

> `optional` **accountIds**: `string`[]

Defined in: [src/types/automation.ts:34](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L34)

Filter by specific account IDs

***

### actorIds?

> `optional` **actorIds**: `string`[]

Defined in: [src/types/automation.ts:36](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L36)

Filter by specific actor IDs

***

### actorTags\_\_contains?

> `optional` **actorTags\_\_contains**: `string`[]

Defined in: [src/types/automation.ts:38](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L38)

Filter by actor tags (all must match)

***

### actorTags\_\_any?

> `optional` **actorTags\_\_any**: `string`[]

Defined in: [src/types/automation.ts:40](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L40)

Filter by actor tags (any must match)
