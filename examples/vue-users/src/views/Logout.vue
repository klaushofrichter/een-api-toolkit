<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { revokeToken } from 'een-api-toolkit'

const router = useRouter()
const processing = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  const result = await revokeToken()

  if (result.error) {
    // Even if revoke fails, the local state is cleared
    console.warn('Token revocation failed:', result.error.message)
  }

  processing.value = false

  // Redirect to home after a short delay
  setTimeout(() => {
    router.push('/')
  }, 2000)
})
</script>

<template>
  <div class="logout">
    <div v-if="processing">
      <h2>Logging out...</h2>
      <p class="loading">Please wait.</p>
    </div>

    <div v-else>
      <h2>Logged Out</h2>
      <p>You have been successfully logged out.</p>
      <p v-if="error" class="error">Note: {{ error }}</p>
      <p class="redirect">Redirecting to home page...</p>
    </div>
  </div>
</template>

<style scoped>
.logout {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
}

.redirect {
  color: #666;
  font-style: italic;
  margin-top: 20px;
}
</style>
