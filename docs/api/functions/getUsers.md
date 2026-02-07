[**EEN API Toolkit v0.3.59**](../README.md)

***

[EEN API Toolkit](../README.md) / getUsers

# Function: getUsers()

> **getUsers**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`User`](../interfaces/User.md)\>\>\>

Defined in: [src/users/service.ts:118](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/users/service.ts#L118)

List users with optional pagination and filtering.

## Parameters

### params?

[`ListUsersParams`](../interfaces/ListUsersParams.md)

Optional pagination and filtering parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`User`](../interfaces/User.md)\>\>\>

A Result containing a paginated list of users or an error

## Remarks

Fetches a paginated list of users from `/api/v3.0/users`. Use the `pageSize`
parameter to control how many results are returned per page, and `pageToken`
to navigate to subsequent pages.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getusers).

## Example

```typescript
import { getUsers } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getUsers()
if (data) {
  console.log(`Found ${data.results.length} users`)
}

// With pagination
const { data } = await getUsers({ pageSize: 50 })
if (data?.nextPageToken) {
  const { data: page2 } = await getUsers({
    pageSize: 50,
    pageToken: data.nextPageToken
  })
}

// Fetch all users
let allUsers: User[] = []
let pageToken: string | undefined
do {
  const { data, error } = await getUsers({ pageSize: 100, pageToken })
  if (error) break
  allUsers.push(...data.results)
  pageToken = data.nextPageToken
} while (pageToken)
```
