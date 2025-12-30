[**EEN API Toolkit v0.0.17**](../README.md)

***

[EEN API Toolkit](../README.md) / useCurrentUser

# Function: useCurrentUser()

> **useCurrentUser**(`options?`): `object`

Defined in: [src/users/composables.ts:61](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/users/composables.ts#L61)

Vue 3 composable for getting the current authenticated user.

## Parameters

### options?

[`UseCurrentUserOptions`](../interfaces/UseCurrentUserOptions.md)

Configuration options

## Returns

Reactive user state and control functions

### user

> **user**: `Ref`\<\{ `id`: `string`; `email`: `string`; `firstName`: `string`; `lastName`: `string`; `accountId?`: `string`; `timeZone?`: `string`; `language?`: `string`; \} \| `null`, [`UserProfile`](../interfaces/UserProfile.md) \| \{ `id`: `string`; `email`: `string`; `firstName`: `string`; `lastName`: `string`; `accountId?`: `string`; `timeZone?`: `string`; `language?`: `string`; \} \| `null`\>

The current user profile, or null if not loaded

### loading

> **loading**: `Ref`\<`boolean`, `boolean`\>

Whether a fetch is in progress

### error

> **error**: `Ref`\<\{ `code`: [`ErrorCode`](../type-aliases/ErrorCode.md); `message`: `string`; `status?`: `number`; `details?`: `unknown`; \} \| `null`, [`EenError`](../interfaces/EenError.md) \| \{ `code`: [`ErrorCode`](../type-aliases/ErrorCode.md); `message`: `string`; `status?`: `number`; `details?`: `unknown`; \} \| `null`\>

The last error that occurred, or null if successful

### fetch()

> **fetch**: () => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`UserProfile`](../interfaces/UserProfile.md)\>\>

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`UserProfile`](../interfaces/UserProfile.md)\>\>

### refresh()

> **refresh**: () => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`UserProfile`](../interfaces/UserProfile.md)\>\>

Alias for fetch - refresh the current user data

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`UserProfile`](../interfaces/UserProfile.md)\>\>

## Remarks

Provides reactive access to the current user's profile with automatic
fetching on component mount (configurable via options).

## Examples

```vue
<script setup>
import { useCurrentUser } from 'een-api-toolkit'

const { user, loading, error, refresh } = useCurrentUser()
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else-if="user">
    <h1>Welcome, {{ user.firstName }}!</h1>
    <p>Email: {{ user.email }}</p>
    <button @click="refresh">Refresh</button>
  </div>
</template>
```

```typescript
// Manual fetch (don't fetch on mount)
const { user, fetch } = useCurrentUser({ immediate: false })

onMounted(async () => {
  if (someCondition) {
    await fetch()
  }
})
```
