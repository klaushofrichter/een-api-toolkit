import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  listEventAlertConditionRules,
  getEventAlertConditionRuleFieldValues,
  getEventAlertConditionRule,
  listAlertConditionRules,
  getAlertConditionRule,
  listAlertActionRules,
  getAlertActionRule,
  listAlertActions,
  getAlertAction
} from '../automations/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Automations service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ===========================================================================
  // listEventAlertConditionRules
  // ===========================================================================
  describe('listEventAlertConditionRules', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listEventAlertConditionRules()

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await listEventAlertConditionRules()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch rules successfully without params', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        results: [
          {
            id: 'rule-1',
            createTimestamp: '2024-01-01T00:00:00.000Z',
            updateTimestamp: '2024-01-01T00:00:00.000Z',
            name: 'Motion Alert Rule',
            priority: 5,
            enabled: true,
            cooldownSeconds: 60,
            eventFilter: { types: ['een.motionDetectionEvent.v1'] },
            outputAlertTypes: ['een.motionDetectionAlert.v1']
          }
        ],
        nextPageToken: 'next-token-123'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listEventAlertConditionRules()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(1)
      expect(result.data?.nextPageToken).toBe('next-token-123')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/eventAlertConditionRules',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should include pagination parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listEventAlertConditionRules({ pageSize: 50, pageToken: 'page-xyz' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('pageSize=50')
      expect(url).toContain('pageToken=page-xyz')
    })

    it('should include filter parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listEventAlertConditionRules({
        enabled: true,
        id__in: ['rule-1', 'rule-2'],
        outputAlertType__in: ['een.motionDetectionAlert.v1'],
        priority__gte: 3,
        priority__lte: 8
      })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('enabled=true')
      expect(url).toContain('id__in=rule-1%2Crule-2')
      expect(url).toContain('outputAlertType__in=een.motionDetectionAlert.v1')
      expect(url).toContain('priority__gte=3')
      expect(url).toContain('priority__lte=8')
    })

    it('should handle 401 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid token' })
      })

      const result = await listEventAlertConditionRules()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
    })

    it('should handle 429 rate limit error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ message: 'Rate limit exceeded' })
      })

      const result = await listEventAlertConditionRules()

      expect(result.error?.code).toBe('RATE_LIMITED')
      expect(result.error?.status).toBe(429)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await listEventAlertConditionRules()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })

  // ===========================================================================
  // getEventAlertConditionRuleFieldValues
  // ===========================================================================
  describe('getEventAlertConditionRuleFieldValues', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getEventAlertConditionRuleFieldValues()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await getEventAlertConditionRuleFieldValues()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch field values successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        eventTypes: ['een.motionDetectionEvent.v1', 'een.objectDetectionEvent.v1'],
        outputAlertTypes: ['een.motionDetectionAlert.v1']
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await getEventAlertConditionRuleFieldValues()

      expect(result.error).toBeNull()
      expect(result.data?.eventTypes).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/eventAlertConditionRules:listFieldValues',
        expect.any(Object)
      )
    })

    it('should include enabled filter', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ eventTypes: [] })
      })

      await getEventAlertConditionRuleFieldValues({ enabled: true })

      const call = mockFetch.mock.calls[0]
      const url = call![0] as string
      expect(url).toContain('enabled=true')
    })
  })

  // ===========================================================================
  // getEventAlertConditionRule
  // ===========================================================================
  describe('getEventAlertConditionRule', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getEventAlertConditionRule('rule-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await getEventAlertConditionRule('rule-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when ruleId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getEventAlertConditionRule('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Rule ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch rule by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockRule = {
        id: 'rule-123',
        name: 'Motion Alert Rule',
        priority: 5,
        enabled: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRule)
      })

      const result = await getEventAlertConditionRule('rule-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockRule)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/eventAlertConditionRules/rule-123',
        expect.any(Object)
      )
    })

    it('should encode ruleId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'rule/123' })
      })

      await getEventAlertConditionRule('rule/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/eventAlertConditionRules/rule%2F123',
        expect.any(Object)
      )
    })

    it('should handle 404 not found error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Rule not found' })
      })

      const result = await getEventAlertConditionRule('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle 403 forbidden error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Access denied' })
      })

      const result = await getEventAlertConditionRule('rule-123')

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })
  })

  // ===========================================================================
  // listAlertConditionRules
  // ===========================================================================
  describe('listAlertConditionRules', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listAlertConditionRules()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await listAlertConditionRules()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch rules successfully without params', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        results: [
          {
            id: 'rule-1',
            name: 'Alert Condition Rule',
            type: 'basic',
            enabled: true,
            priority: 5,
            actors: [],
            inputEventTypes: ['een.motionDetectionEvent.v1'],
            outputAlertType: 'een.motionDetectionAlert.v1'
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listAlertConditionRules()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/alertConditionRules',
        expect.any(Object)
      )
    })

    it('should include filter parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listAlertConditionRules({
        enabled: true,
        actorId__in: ['actor-1', 'actor-2'],
        inputEventType__in: ['een.motionDetectionEvent.v1'],
        outputAlertType: 'een.motionDetectionAlert.v1',
        type: 'basic',
        include: ['actions', 'insights']
      })

      const call = mockFetch.mock.calls[0]
      const url = call![0] as string
      expect(url).toContain('enabled=true')
      expect(url).toContain('actorId__in=actor-1%2Cactor-2')
      expect(url).toContain('inputEventType__in=een.motionDetectionEvent.v1')
      expect(url).toContain('outputAlertType=een.motionDetectionAlert.v1')
      expect(url).toContain('type=basic')
      expect(url).toContain('include=actions%2Cinsights')
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await listAlertConditionRules()

      expect(result.error?.code).toBe('NETWORK_ERROR')
    })
  })

  // ===========================================================================
  // getAlertConditionRule
  // ===========================================================================
  describe('getAlertConditionRule', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getAlertConditionRule('rule-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await getAlertConditionRule('rule-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
    })

    it('should return VALIDATION_ERROR when ruleId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getAlertConditionRule('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Rule ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch rule by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockRule = {
        id: 'rule-123',
        name: 'Alert Rule',
        enabled: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRule)
      })

      const result = await getAlertConditionRule('rule-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockRule)
    })

    it('should include include parameter', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'rule-123' })
      })

      await getAlertConditionRule('rule-123', {
        include: ['actions', 'insights']
      })

      const call = mockFetch.mock.calls[0]
      const url = call![0] as string
      expect(url).toContain('include=actions%2Cinsights')
    })

    it('should handle 404 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Rule not found' })
      })

      const result = await getAlertConditionRule('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
    })
  })

  // ===========================================================================
  // listAlertActionRules
  // ===========================================================================
  describe('listAlertActionRules', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listAlertActionRules()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await listAlertActionRules()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
    })

    it('should fetch rules successfully without params', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        results: [
          {
            id: 'rule-1',
            name: 'Action Rule',
            enabled: true,
            alertTypes: ['een.motionDetectionAlert.v1'],
            actorIds: [],
            actorTypes: [],
            ruleIds: [],
            alertActionIds: ['action-1']
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listAlertActionRules()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(1)
    })

    it('should include filter parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listAlertActionRules({
        enabled: true,
        alertType__in: ['een.motionDetectionAlert.v1'],
        actorId__in: ['actor-1'],
        alertActionId__in: ['action-1'],
        ruleId__in: ['rule-1']
      })

      const call = mockFetch.mock.calls[0]
      const url = call![0] as string
      expect(url).toContain('enabled=true')
      expect(url).toContain('alertType__in=een.motionDetectionAlert.v1')
      expect(url).toContain('actorId__in=actor-1')
      expect(url).toContain('alertActionId__in=action-1')
      expect(url).toContain('ruleId__in=rule-1')
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await listAlertActionRules()

      expect(result.error?.code).toBe('NETWORK_ERROR')
    })
  })

  // ===========================================================================
  // getAlertActionRule
  // ===========================================================================
  describe('getAlertActionRule', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getAlertActionRule('rule-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await getAlertActionRule('rule-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
    })

    it('should return VALIDATION_ERROR when ruleId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getAlertActionRule('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Rule ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch rule by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockRule = {
        id: 'rule-123',
        name: 'Action Rule',
        enabled: true,
        alertTypes: ['een.motionDetectionAlert.v1']
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRule)
      })

      const result = await getAlertActionRule('rule-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockRule)
    })

    it('should encode ruleId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'rule/123' })
      })

      await getAlertActionRule('rule/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/alertActionRules/rule%2F123',
        expect.any(Object)
      )
    })

    it('should handle 404 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Rule not found' })
      })

      const result = await getAlertActionRule('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
    })
  })

  // ===========================================================================
  // listAlertActions
  // ===========================================================================
  describe('listAlertActions', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listAlertActions()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await listAlertActions()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
    })

    it('should fetch actions successfully without params', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        results: [
          {
            id: 'action-1',
            createTimestamp: '2024-01-01T00:00:00.000Z',
            type: 'notification',
            name: 'Push Notification',
            enabled: true,
            settings: { userIds: ['user-1'] }
          },
          {
            id: 'action-2',
            createTimestamp: '2024-01-01T00:00:00.000Z',
            type: 'webhook',
            name: 'Webhook Action',
            enabled: true,
            settings: { url: 'https://example.com/webhook' }
          }
        ],
        nextPageToken: 'next-token'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listAlertActions()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(2)
      expect(result.data?.nextPageToken).toBe('next-token')
    })

    it('should include filter parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listAlertActions({
        enabled: true,
        id__in: ['action-1', 'action-2'],
        type__in: ['notification', 'webhook']
      })

      const call = mockFetch.mock.calls[0]
      const url = call![0] as string
      expect(url).toContain('enabled=true')
      expect(url).toContain('id__in=action-1%2Caction-2')
      expect(url).toContain('type__in=notification%2Cwebhook')
    })

    it('should include pagination parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listAlertActions({ pageSize: 25, pageToken: 'token-abc' })

      const call = mockFetch.mock.calls[0]
      const url = call![0] as string
      expect(url).toContain('pageSize=25')
      expect(url).toContain('pageToken=token-abc')
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'))

      const result = await listAlertActions()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection timeout')
    })

    it('should handle 429 rate limit error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ message: 'Rate limit exceeded' })
      })

      const result = await listAlertActions()

      expect(result.error?.code).toBe('RATE_LIMITED')
      expect(result.error?.status).toBe(429)
    })
  })

  // ===========================================================================
  // getAlertAction
  // ===========================================================================
  describe('getAlertAction', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getAlertAction('action-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await getAlertAction('action-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
    })

    it('should return VALIDATION_ERROR when actionId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getAlertAction('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Action ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch action by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockAction = {
        id: 'action-123',
        createTimestamp: '2024-01-01T00:00:00.000Z',
        type: 'webhook',
        name: 'My Webhook',
        enabled: true,
        settings: { url: 'https://example.com/webhook' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAction)
      })

      const result = await getAlertAction('action-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockAction)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/alertActions/action-123',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode actionId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'action/123' })
      })

      await getAlertAction('action/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/alertActions/action%2F123',
        expect.any(Object)
      )
    })

    it('should handle 404 not found error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Action not found' })
      })

      const result = await getAlertAction('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle 403 forbidden error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Access denied' })
      })

      const result = await getAlertAction('action-123')

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('DNS resolution failed'))

      const result = await getAlertAction('action-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('DNS resolution failed')
    })
  })
})
