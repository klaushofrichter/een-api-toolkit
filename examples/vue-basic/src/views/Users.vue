<script setup lang="ts">
import { useUsers } from 'een-api-toolkit'

const {
  users,
  loading,
  error,
  hasNextPage,
  fetchNextPage,
  refresh
} = useUsers({ pageSize: 10 })
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

<style scoped>
.users {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f5f5f5;
  font-weight: 600;
}

.active {
  color: #27ae60;
}

.inactive {
  color: #e74c3c;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
