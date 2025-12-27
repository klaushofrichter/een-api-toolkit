[**EEN API Toolkit v0.0.4**](../README.md)

***

[EEN API Toolkit](../README.md) / EenError

# Interface: EenError

Defined in: [src/types/common.ts:42](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L42)

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

Defined in: [src/types/common.ts:44](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L44)

Machine-readable error code for programmatic handling

***

### message

> **message**: `string`

Defined in: [src/types/common.ts:46](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L46)

Human-readable error message

***

### status?

> `optional` **status**: `number`

Defined in: [src/types/common.ts:48](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L48)

HTTP status code if the error came from an API response

***

### details?

> `optional` **details**: `unknown`

Defined in: [src/types/common.ts:50](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L50)

Additional error details (varies by error type)
