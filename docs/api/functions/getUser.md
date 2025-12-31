[**EEN API Toolkit v0.1.1**](../README.md)

***

[EEN API Toolkit](../README.md) / getUser

# Function: getUser()

> **getUser**(`userId`, `params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`User`](../interfaces/User.md)\>\>

Defined in: [src/users/service.ts:205](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/users/service.ts#L205)

Get a specific user by ID.

## Parameters

### userId

`string`

The unique identifier of the user to fetch

### params?

[`GetUserParams`](../interfaces/GetUserParams.md)

Optional parameters (e.g., include additional fields)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`User`](../interfaces/User.md)\>\>

A Result containing the user or an error

## Remarks

Fetches a single user from `/api/v3.0/users/{userId}`. Use the `include`
parameter to request additional fields like permissions.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getuser).

## Example

```typescript
import { getUser } from 'een-api-toolkit'

const { data, error } = await getUser('user-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('User not found')
  }
  return
}

console.log(`User: ${data.firstName} ${data.lastName}`)

// With permissions
const { data: userWithPerms } = await getUser('user-123', {
  include: ['permissions']
})
console.log('Permissions:', userWithPerms?.permissions)
```
