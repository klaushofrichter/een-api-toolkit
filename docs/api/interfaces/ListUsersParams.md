[**EEN API Toolkit v0.3.60**](../README.md)

***

[EEN API Toolkit](../README.md) / ListUsersParams

# Interface: ListUsersParams

Defined in: [src/types/user.ts:88](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L88)

Parameters for listing users.

## Remarks

Extends basic pagination with user-specific options like the `include`
parameter for requesting additional user data.

## Example

```typescript
// Get users with permissions included
const { data } = await getUsers({
  pageSize: 50,
  include: ['permissions']
})
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [src/types/user.ts:90](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L90)

Number of results per page (default: 100, max: 1000)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/user.ts:92](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L92)

Token for fetching a specific page

***

### include?

> `optional` **include**: `string`[]

Defined in: [src/types/user.ts:94](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L94)

Additional fields to include in the response (e.g., ['permissions'])
