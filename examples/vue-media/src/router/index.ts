import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from 'een-api-toolkit'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Callback from '../views/Callback.vue'
import LiveCamera from '../views/LiveCamera.vue'
import Logout from '../views/Logout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      // Handle OAuth callback on root path (EEN IDP redirects to http://127.0.0.1:3333)
      beforeEnter: (to, _from, next) => {
        // If URL has code and state params, it's an OAuth callback
        if (to.query.code && to.query.state) {
          next({ name: 'callback', query: to.query })
        } else {
          next()
        }
      }
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
      path: '/live',
      name: 'live',
      component: LiveCamera,
      meta: { requiresAuth: true }
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout
    }
  ]
})

// Navigation guard for protected routes
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
