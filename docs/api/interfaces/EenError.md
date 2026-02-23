[**EEN API Toolkit v0.3.97**](../README.md)

***

[EEN API Toolkit](../README.md) / EenError

# Interface: EenError

Defined in: [types/common.ts:43](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L43)

Error object returned when an operation fails.

## Remarks

Contains structured error information including a machine-readable code,
human-readable message, and optional HTTP status code.

## Example

```typescript
const { error } = await getUsers()
if (error) {
  console.error(`${error.code}: ${error.message}`)
  if (error.status === 401) {
    redirectToLogin()
  }
}
```

## Properties

### code

> **code**: [`ErrorCode`](../type-aliases/ErrorCode.md)

Defined in: [types/common.ts:45](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L45)

Machine-readable error code for programmatic handling

***

### message

> **message**: `string`

Defined in: [types/common.ts:47](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L47)

Human-readable error message

***

### status?

> `optional` **status**: `number`

Defined in: [types/common.ts:49](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L49)

HTTP status code if the error came from an API response

***

### details?

> `optional` **details**: `unknown`

Defined in: [types/common.ts:51](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L51)

Additional error details (varies by error type)
