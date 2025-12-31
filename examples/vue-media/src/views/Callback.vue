<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { handleAuthCallback } from 'een-api-toolkit'

const router = useRouter()
const error = ref<string | null>(null)
const processing = ref(true)

onMounted(async () => {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')

  if (errorParam) {
    error.value = `OAuth error: ${errorParam}`
    processing.value = false
    return
  }

  if (!code || !state) {
    error.value = 'Missing authorization code or state parameter'
    processing.value = false
    return
  }

  const result = await handleAuthCallback(code, state)

  if (result.error) {
    error.value = result.error.message
    processing.value = false
    return
  }

  // Success - redirect to live camera view
  router.push('/live')
})
</script>

<template>
  <div class="callback">
    <div v-if="processing" class="loading">
      <h2>Authenticating...</h2>
      <p>Please wait while we complete the login process.</p>
    </div>

    <div v-else-if="error" class="error-state">
      <h2>Authentication Failed</h2>
      <p class="error">{{ error }}</p>
      <router-link to="/login">
        <button>Try Again</button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.callback {
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
