[**EEN API Toolkit v0.0.11**](../README.md)

***

[EEN API Toolkit](../README.md) / useUsers

# Function: useUsers()

> **useUsers**(`initialParams?`, `options?`): `object`

Defined in: [src/users/composables.ts:172](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/users/composables.ts#L172)

Vue 3 composable for listing users with pagination.

## Parameters

### initialParams?

[`ListUsersParams`](../interfaces/ListUsersParams.md)

Initial pagination/filter parameters

### options?

[`UseUsersOptions`](../interfaces/UseUsersOptions.md)

Configuration options

## Returns

Reactive users state and pagination controls

### users

> **users**: `Ref`\<`object`[], [`User`](../interfaces/User.md)[] \| `object`[]\>

Array of users for the current page

### loading

> **loading**: `Ref`\<`boolean`, `boolean`\>

Whether a fetch is in progress

### error

> **error**: `Ref`\<\{ `code`: [`ErrorCode`](../type-aliases/ErrorCode.md); `message`: `string`; `status?`: `number`; `details?`: `unknown`; \} \| `null`, [`EenError`](../interfaces/EenError.md) \| \{ `code`: [`ErrorCode`](../type-aliases/ErrorCode.md); `message`: `string`; `status?`: `number`; `details?`: `unknown`; \} \| `null`\>

The last error that occurred, or null if successful

### nextPageToken

> **nextPageToken**: `Ref`\<`string` \| `undefined`, `string` \| `undefined`\>

Token for fetching the next page

### prevPageToken

> **prevPageToken**: `Ref`\<`string` \| `undefined`, `string` \| `undefined`\>

Token for fetching the previous page

### totalSize

> **totalSize**: `Ref`\<`number` \| `undefined`, `number` \| `undefined`\>

Total number of users (if provided by API)

### hasNextPage

> **hasNextPage**: `ComputedRef`\<`boolean`\>

Whether there is a next page available

### hasPrevPage

> **hasPrevPage**: `ComputedRef`\<`boolean`\>

Whether there is a previous page available

### params

> **params**: `Ref`\<\{ `pageSize?`: `number`; `pageToken?`: `string`; `include?`: `string`[]; \}, [`ListUsersParams`](../interfaces/ListUsersParams.md) \| \{ `pageSize?`: `number`; `pageToken?`: `string`; `include?`: `string`[]; \}\>

Current pagination/filter parameters

### fetch()

> **fetch**: (`fetchParams?`) => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`User`](../interfaces/User.md)\>\>\>

#### Parameters

##### fetchParams?

[`ListUsersParams`](../interfaces/ListUsersParams.md)

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`User`](../interfaces/User.md)\>\>\>

### refresh()

> **refresh**: () => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`User`](../interfaces/User.md)\>\>\>

Refresh the current page

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`User`](../interfaces/User.md)\>\>\>

### fetchNextPage()

> **fetchNextPage**: () => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`User`](../interfaces/User.md)\>\> \| `undefined`\>

Fetch the next page of results

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`User`](../interfaces/User.md)\>\> \| `undefined`\>

### fetchPrevPage()

> **fetchPrevPage**: () => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`User`](../interfaces/User.md)\>\> \| `undefined`\>

Fetch the previous page of results

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`User`](../interfaces/User.md)\>\> \| `undefined`\>

### setParams()

> **setParams**: (`newParams`) => `void`

Update the pagination/filter parameters

#### Parameters

##### newParams

[`ListUsersParams`](../interfaces/ListUsersParams.md)

#### Returns

`void`

## Remarks

Provides reactive access to a paginated list of users with built-in
pagination controls. Automatically fetches on mount unless disabled.

## Examples

```vue
<script setup>
import { useUsers } from 'een-api-toolkit'

const {
  users,
  loading,
  error,
  hasNextPage,
  fetchNextPage,
  refresh
} = useUsers({ pageSize: 20 })
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
      </li>
    </ul>
    <button v-if="hasNextPage" @click="fetchNextPage">
      Load More
    </button>
    <button @click="refresh">Refresh</button>
  </div>
</template>
```

```typescript
// Change parameters dynamically
const { users, setParams, fetch } = useUsers()

async function searchUsers(query: string) {
  setParams({ pageSize: 50 })
  await fetch()
}
```
