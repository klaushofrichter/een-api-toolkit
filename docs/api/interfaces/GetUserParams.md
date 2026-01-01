[**EEN API Toolkit v0.1.9**](../README.md)

***

[EEN API Toolkit](../README.md) / GetUserParams

# Interface: GetUserParams

Defined in: [src/types/user.ts:109](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L109)

Parameters for getting a single user.

## Example

```typescript
const { data } = await getUser('user-id', {
  include: ['permissions']
})
```

## Properties

### include?

> `optional` **include**: `string`[]

Defined in: [src/types/user.ts:111](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L111)

Additional fields to include in the response
