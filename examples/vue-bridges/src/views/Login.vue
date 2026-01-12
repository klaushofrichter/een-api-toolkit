<script setup lang="ts">
import { getAuthUrl } from 'een-api-toolkit'

function login() {
  // Redirect to EEN OAuth login
  window.location.href = getAuthUrl()
}
</script>

<template>
  <div class="login">
    <h2>Login</h2>
    <p>Click the button below to login with your Eagle Eye Networks account.</p>
    <button @click="login">Login with Eagle Eye Networks</button>
  </div>
</template>

<style scoped>
.login {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
}

p {
  margin-bottom: 20px;
  color: #666;
}
</style>
