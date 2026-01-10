[**EEN API Toolkit v0.3.10**](../README.md)

***

[EEN API Toolkit](../README.md) / getCurrentUser

# Function: getCurrentUser()

> **getCurrentUser**(): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`UserProfile`](../interfaces/UserProfile.md)\>\>

Defined in: [src/users/service.ts:33](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/users/service.ts#L33)

Get the current authenticated user's profile.

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`UserProfile`](../interfaces/UserProfile.md)\>\>

A Result containing the user profile or an error

## Remarks

Fetches the profile of the currently authenticated user from `/api/v3.0/users/self`.
The result is also stored in the auth store for easy access via `useAuthStore().userProfile`.

## Example

```typescript
import { getCurrentUser } from 'een-api-toolkit'

const { data, error } = await getCurrentUser()

if (error) {
  if (error.code === 'AUTH_REQUIRED') {
    router.push('/login')
  }
  return
}

console.log(`Welcome, ${data.firstName} ${data.lastName}`)
```
