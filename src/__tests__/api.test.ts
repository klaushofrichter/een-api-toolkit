import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { requireAuth, authHeaders, handleErrorResponse } from '../utils/api'
import { useAuthStore } from '../auth/store'

function mockErrorResponse(status: number, body?: Record<string, unknown>, statusText = ''): Response {
  return {
    status,
    statusText,
    json: async () => {
      if (body === undefined) {
        throw new Error('invalid JSON')
      }
      return body
    }
  } as unknown as Response
}

describe('requireAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fails with AUTH_REQUIRED when not authenticated', () => {
    const auth = requireAuth()

    expect(auth.ok).toBe(false)
    if (!auth.ok) {
      expect(auth.result.data).toBeNull()
      expect(auth.result.error?.code).toBe('AUTH_REQUIRED')
      expect(auth.result.error?.message).toBe('Authentication required')
    }
  })

  it('fails with AUTH_REQUIRED when base URL is not configured', () => {
    const store = useAuthStore()
    store.setToken('test-token', 3600)

    const auth = requireAuth()

    expect(auth.ok).toBe(false)
    if (!auth.ok) {
      expect(auth.result.error?.code).toBe('AUTH_REQUIRED')
      expect(auth.result.error?.message).toBe('Base URL not configured')
    }
  })

  it('returns the auth store and base URL when authenticated', () => {
    const store = useAuthStore()
    store.setToken('test-token', 3600)
    store.setBaseUrl('https://api.c001.eagleeyenetworks.com')

    const auth = requireAuth()

    expect(auth.ok).toBe(true)
    if (auth.ok) {
      expect(auth.baseUrl).toBe('https://api.c001.eagleeyenetworks.com')
      expect(auth.authStore.token).toBe('test-token')
    }
  })
})

describe('authHeaders', () => {
  it('returns Accept and Authorization headers', () => {
    expect(authHeaders('test-token')).toEqual({
      'Accept': 'application/json',
      'Authorization': 'Bearer test-token'
    })
  })
})

describe('handleErrorResponse', () => {
  it.each([
    [400, 'VALIDATION_ERROR', 'Bad request: oops'],
    [401, 'AUTH_REQUIRED', 'Authentication failed: oops'],
    [403, 'FORBIDDEN', 'Access denied: oops'],
    [404, 'NOT_FOUND', 'Not found: oops'],
    [429, 'RATE_LIMITED', 'Rate limited: oops'],
    [503, 'SERVICE_UNAVAILABLE', 'Service unavailable: oops'],
    [500, 'API_ERROR', 'API error: oops'],
    [502, 'API_ERROR', 'API error: oops']
  ])('maps HTTP %i to %s', async (status, code, message) => {
    const result = await handleErrorResponse(mockErrorResponse(status, { message: 'oops' }))

    expect(result.data).toBeNull()
    expect(result.error?.code).toBe(code)
    expect(result.error?.message).toBe(message)
    expect(result.error?.status).toBe(status)
  })

  it('falls back to the error field when message is missing', async () => {
    const result = await handleErrorResponse(mockErrorResponse(404, { error: 'gone' }))

    expect(result.error?.code).toBe('NOT_FOUND')
    expect(result.error?.message).toBe('Not found: gone')
  })

  it('falls back to statusText when the body is empty', async () => {
    const result = await handleErrorResponse(mockErrorResponse(500, {}, 'Internal Server Error'))

    expect(result.error?.code).toBe('API_ERROR')
    expect(result.error?.message).toBe('API error: Internal Server Error')
  })

  it('falls back to statusText when the body is not JSON', async () => {
    const result = await handleErrorResponse(mockErrorResponse(503, undefined, 'Service Unavailable'))

    expect(result.error?.code).toBe('SERVICE_UNAVAILABLE')
    expect(result.error?.message).toBe('Service unavailable: Service Unavailable')
  })

  it('uses a generic message when both body and statusText are missing', async () => {
    const result = await handleErrorResponse(mockErrorResponse(500, undefined, ''))

    expect(result.error?.code).toBe('API_ERROR')
    expect(result.error?.message).toBe('API error: Unknown error')
  })
})
