[**EEN API Toolkit v0.0.11**](../README.md)

***

[EEN API Toolkit](../README.md) / useUser

# Function: useUser()

> **useUser**(`userId`, `options?`): `object`

Defined in: [src/users/composables.ts:331](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/users/composables.ts#L331)

Vue 3 composable for getting a single user by ID.

## Parameters

### userId

The user ID (string or getter function)

`string` | () => `string`

### options?

[`UseUserOptions`](../interfaces/UseUserOptions.md)

Configuration options

## Returns

Reactive user state and control functions

### user

> **user**: `Ref`\<\{ `id`: `string`; `email`: `string`; `firstName`: `string`; `lastName`: `string`; `accountId?`: `string`; `timeZone?`: `string`; `language?`: `string`; `phone?`: `string`; `mobilePhone?`: `string`; `permissions?`: `string`[]; `lastLogin?`: `string`; `isActive?`: `boolean`; `createdAt?`: `string`; `updatedAt?`: `string`; \} \| `null`, [`User`](../interfaces/User.md) \| \{ `id`: `string`; `email`: `string`; `firstName`: `string`; `lastName`: `string`; `accountId?`: `string`; `timeZone?`: `string`; `language?`: `string`; `phone?`: `string`; `mobilePhone?`: `string`; `permissions?`: `string`[]; `lastLogin?`: `string`; `isActive?`: `boolean`; `createdAt?`: `string`; `updatedAt?`: `string`; \} \| `null`\>

The user, or null if not loaded

### loading

> **loading**: `Ref`\<`boolean`, `boolean`\>

Whether a fetch is in progress

### error

> **error**: `Ref`\<\{ `code`: [`ErrorCode`](../type-aliases/ErrorCode.md); `message`: `string`; `status?`: `number`; `details?`: `unknown`; \} \| `null`, [`EenError`](../interfaces/EenError.md) \| \{ `code`: [`ErrorCode`](../type-aliases/ErrorCode.md); `message`: `string`; `status?`: `number`; `details?`: `unknown`; \} \| `null`\>

The last error that occurred, or null if successful

### fetch()

> **fetch**: (`params?`) => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`User`](../interfaces/User.md)\>\>

#### Parameters

##### params?

[`GetUserParams`](../interfaces/GetUserParams.md)

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`User`](../interfaces/User.md)\>\>

### refresh()

> **refresh**: () => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`User`](../interfaces/User.md)\>\>

Refresh the user data

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`User`](../interfaces/User.md)\>\>

## Remarks

Provides reactive access to a specific user. The user ID can be provided
as a string or a getter function (useful for reactive route params).

## Examples

```vue
<script setup>
import { useUser } from 'een-api-toolkit'
import { useRoute } from 'vue-router'

const route = useRoute()

// Static ID
const { user, loading, error } = useUser('user-123')

// Or reactive ID from route
const { user: routeUser } = useUser(() => route.params.id as string)
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else-if="user">
    <h1>{{ user.firstName }} {{ user.lastName }}</h1>
    <p>Email: {{ user.email }}</p>
  </div>
</template>
```

```typescript
// With additional fields
const { user } = useUser('user-123', {
  include: ['permissions']
})

// Access permissions when loaded
watchEffect(() => {
  if (user.value?.permissions) {
    console.log('User permissions:', user.value.permissions)
  }
})
```
