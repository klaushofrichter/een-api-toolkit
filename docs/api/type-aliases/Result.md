[**EEN API Toolkit v0.0.13**](../README.md)

***

[EEN API Toolkit](../README.md) / Result

# Type Alias: Result\<T\>

> **Result**\<`T`\> = \{ `data`: `T`; `error`: `null`; \} \| \{ `data`: `null`; `error`: [`EenError`](../interfaces/EenError.md); \}

Defined in: [src/types/common.ts:78](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/common.ts#L78)

Result type for all API operations - functions never throw exceptions.

## Type Parameters

### T

`T`

The type of the data on success

## Remarks

This is a discriminated union type. When `error` is `null`, `data` contains
the successful result. When `error` is not `null`, `data` is `null`.
TypeScript will narrow the type correctly after checking for errors.

## Example

```typescript
const { data, error } = await getUsers()

if (error) {
  // TypeScript knows: data is null, error is EenError
  console.error(error.message)
  return
}

// TypeScript knows: data is not null, error is null
console.log(data.results)
```
