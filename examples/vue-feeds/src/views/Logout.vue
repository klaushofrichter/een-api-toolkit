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
    error.value = result.error.message
    processing.value = false
    return
  }

  // Success - redirect to home
  router.push('/')
})
</script>

<template>
  <div class="logout">
    <div v-if="processing" class="loading">
      <h2>Logging out...</h2>
      <p>Please wait while we complete the logout process.</p>
    </div>

    <div v-else-if="error" class="error-state">
      <h2>Logout Error</h2>
      <p class="error">{{ error }}</p>
      <router-link to="/">
        <button>Return Home</button>
      </router-link>
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

.loading p {
  color: #666;
}

.error-state .error {
  margin-bottom: 20px;
}
</style>
