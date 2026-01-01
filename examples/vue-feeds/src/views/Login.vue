<script setup lang="ts">
import { getAuthUrl } from 'een-api-toolkit'

function login() {
  window.location.href = getAuthUrl()
}
</script>

<template>
  <div class="login">
    <h2>Login</h2>
    <p>Click the button below to authenticate with Eagle Eye Networks.</p>
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
