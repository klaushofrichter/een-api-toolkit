import { test, expect } from '@playwright/test'
import { getAuthToken, clearAuthCache, AuthState } from './auth-helper'

test.describe('Auth Helper', () => {
  let auth: AuthState

  test('getAuthToken returns valid access token', async ({ request }) => {
    // Get token from helper
    auth = await getAuthToken()

    // Verify auth state structure
    expect(auth).toHaveProperty('token')
    expect(auth).toHaveProperty('baseUrl')
    expect(auth).toHaveProperty('sessionId')
    expect(auth).toHaveProperty('tokenExpiration')

    // Verify token is not expired
    expect(auth.tokenExpiration).toBeGreaterThan(Date.now())

    // Verify token works by calling /users/self API
    const response = await request.get(`${auth.baseUrl}/api/v3.0/users/self`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      }
    })

    expect(response.ok()).toBe(true)

    const user = await response.json()
    expect(user).toHaveProperty('email')
    console.log('Token valid - authenticated as:', user.email)
  })
})
