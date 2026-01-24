import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from 'een-api-toolkit'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Callback from '../views/Callback.vue'
import Layouts from '../views/Layouts.vue'
import Logout from '../views/Logout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    },
    {
      path: '/layouts',
      name: 'layouts',
      component: Layouts,
      meta: { requiresAuth: true }
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout
    }
  ]
})

// Navigation guard for OAuth callback and protected routes
// IMPORTANT: OAuth callback check MUST come FIRST, before auth check
// This ensures the callback is processed even if the root route becomes protected
router.beforeEach((to, _from, next) => {
  // Handle OAuth callback on root path (EEN IDP redirects to http://127.0.0.1:3333)
  // Check for code and state params which indicate an OAuth callback
  if (to.path === '/' && to.query.code && to.query.state) {
    next({ name: 'callback', query: to.query })
    return
  }

  // Check authentication for protected routes
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
