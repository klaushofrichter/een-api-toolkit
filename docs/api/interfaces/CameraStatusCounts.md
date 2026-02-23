[**EEN API Toolkit v0.3.101**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraStatusCounts

# Interface: CameraStatusCounts

Defined in: [types/layout.ts:9](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L9)

Camera status counts for layout resource summaries.

## Remarks

Used in resourceStatusCounts to show aggregated camera statuses.

## Properties

### online?

> `optional` **online**: `number`

Defined in: [types/layout.ts:11](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L11)

Number of online cameras

***

### offline?

> `optional` **offline**: `number`

Defined in: [types/layout.ts:13](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L13)

Number of offline cameras

***

### error?

> `optional` **error**: `number`

Defined in: [types/layout.ts:15](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L15)

Number of cameras in error state

***

### other?

> `optional` **other**: `number`

Defined in: [types/layout.ts:17](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L17)

Number of cameras with other statuses
