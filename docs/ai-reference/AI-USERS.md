# Users API - EEN API Toolkit

> **Version:** 0.3.33
>
> Complete reference for user management.
> Load this document when working with user data.

---

## Types

### User

```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  accountId?: string
  timeZone?: string       // IANA timezone (e.g., "America/Los_Angeles")
  language?: string       // ISO 639-1 code (e.g., "en")
  phone?: string
  mobilePhone?: string
  permissions?: string[]  // Requires include: ['permissions']
  lastLogin?: string      // ISO 8601 timestamp
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}
```

### UserProfile

```typescript
interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  accountId?: string
  timeZone?: string
  language?: string
}
```

### Parameters

```typescript
interface ListUsersParams {
  pageSize?: number    // Results per page (default: 100, max: 1000)
  pageToken?: string   // Pagination token
  include?: string[]   // Additional fields (e.g., ['permissions'])
}

interface GetUserParams {
  include?: string[]   // Additional fields to include
}
```

---

## Functions

### getCurrentUser()

Get the current authenticated user's profile.

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

### getUsers(params?)

List users with optional pagination.

```typescript
import { getUsers } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getUsers()

// With pagination
const { data } = await getUsers({ pageSize: 50 })

// With include
const { data } = await getUsers({ include: ['permissions'] })
```

### getUser(userId, params?)

Get a specific user by ID.

```typescript
import { getUser } from 'een-api-toolkit'

const { data, error } = await getUser('user-id-123')

if (error?.code === 'NOT_FOUND') {
  console.log('User not found')
  return
}

// With permissions
const { data: userWithPerms } = await getUser('user-id-123', {
  include: ['permissions']
})
```

---

## Pagination Example

```typescript
async function fetchAllUsers(): Promise<User[]> {
  const allUsers: User[] = []
  let pageToken: string | undefined

  do {
    const { data, error } = await getUsers({ pageSize: 100, pageToken })
    if (error) break
    allUsers.push(...data.results)
    pageToken = data.nextPageToken
  } while (pageToken)

  return allUsers
}
```

---

## Complete Vue Component

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getUsers, type User, type EenError, type ListUsersParams } from 'een-api-toolkit'

// Reactive state
const users = ref<User[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)

const hasNextPage = computed(() => !!nextPageToken.value)

const params = ref<ListUsersParams>({ pageSize: 10 })

async function fetchUsers(fetchParams?: ListUsersParams, append = false) {
  loading.value = true
  error.value = null

  const mergedParams = { ...params.value, ...fetchParams }
  const result = await getUsers(mergedParams)

  if (result.error) {
    error.value = result.error
    if (!append) {
      users.value = []
    }
    nextPageToken.value = undefined
  } else {
    if (append) {
      users.value = [...users.value, ...result.data.results]
    } else {
      users.value = result.data.results
    }
    nextPageToken.value = result.data.nextPageToken
  }

  loading.value = false
  return result
}

function refresh() {
  return fetchUsers()
}

async function fetchNextPage() {
  if (!nextPageToken.value) return
  return fetchUsers({ ...params.value, pageToken: nextPageToken.value }, true)
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="users">
    <div class="header">
      <h2>Users</h2>
      <button @click="refresh" :disabled="loading">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="loading && users.length === 0" class="loading">
      Loading users...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-else>
      <table v-if="users.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="user.isActive ? 'active' : 'inactive'">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else>No users found.</p>

      <div v-if="hasNextPage" class="pagination">
        <button @click="fetchNextPage" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>
```

---

## Reference Example

See `examples/vue-users/src/views/Users.vue`
