import { success, failure } from '../types'
import type {
  Result,
  PaginatedResult,
  EventAlertConditionRule,
  EventAlertConditionRuleFieldValues,
  AlertConditionRule,
  AlertActionRule,
  AutomationAlertAction,
  ListEventAlertConditionRulesParams,
  GetEventAlertConditionRuleFieldValuesParams,
  ListAlertConditionRulesParams,
  GetAlertConditionRuleParams,
  ListAlertActionRulesParams,
  ListAlertActionsParams
} from '../types'
import { requireAuth, authHeaders, handleErrorResponse } from '../utils/api'
import { debug } from '../utils'

// =============================================================================
// Event Alert Condition Rules
// =============================================================================

/**
 * List event alert condition rules with optional filters and pagination.
 *
 * @remarks
 * Fetches a paginated list of event alert condition rules from
 * `/api/v3.0/eventAlertConditionRules`. These rules define conditions
 * under which events trigger alerts.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listalertconditionrules).
 *
 * @param params - Optional filtering and pagination parameters
 * @returns A Result containing a paginated list of rules or an error
 *
 * @example
 * ```typescript
 * import { listEventAlertConditionRules } from 'een-api-toolkit'
 *
 * // Get enabled rules
 * const { data, error } = await listEventAlertConditionRules({
 *   enabled: true,
 *   pageSize: 50
 * })
 *
 * if (data) {
 *   console.log(`Found ${data.results.length} rules`)
 *   data.results.forEach(rule => {
 *     console.log(`${rule.name}: priority ${rule.priority}`)
 *   })
 * }
 * ```
 *
 * @category Automations
 */
export async function listEventAlertConditionRules(
  params?: ListEventAlertConditionRulesParams
): Promise<Result<PaginatedResult<EventAlertConditionRule>>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  const queryParams = new URLSearchParams()

  // Pagination
  if (params?.pageSize) {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }

  // Filters
  if (params?.enabled !== undefined) {
    queryParams.append('enabled', String(params.enabled))
  }
  if (params?.id__in && params.id__in.length > 0) {
    queryParams.append('id__in', params.id__in.join(','))
  }
  if (params?.outputAlertType__in && params.outputAlertType__in.length > 0) {
    queryParams.append('outputAlertType__in', params.outputAlertType__in.join(','))
  }
  if (params?.priority__gte !== undefined) {
    queryParams.append('priority__gte', String(params.priority__gte))
  }
  if (params?.priority__lte !== undefined) {
    queryParams.append('priority__lte', String(params.priority__lte))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/eventAlertConditionRules${queryString ? `?${queryString}` : ''}`
  debug('Fetching event alert condition rules:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<EventAlertConditionRule>
    debug('Event alert condition rules fetched:', data.results?.length ?? 0, 'rules')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch event alert condition rules: ${String(err)}`)
  }
}

/**
 * Get available field values for event alert condition rules.
 *
 * @remarks
 * Fetches available values that can be used for filtering event alert condition rules.
 * Useful for building filter UI components.
 *
 * @param params - Optional filter parameters
 * @returns A Result containing field values or an error
 *
 * @example
 * ```typescript
 * import { getEventAlertConditionRuleFieldValues } from 'een-api-toolkit'
 *
 * const { data, error } = await getEventAlertConditionRuleFieldValues()
 * if (data) {
 *   console.log('Available event types:', data.eventTypes)
 *   console.log('Available alert types:', data.outputAlertTypes)
 * }
 * ```
 *
 * @category Automations
 */
export async function getEventAlertConditionRuleFieldValues(
  params?: GetEventAlertConditionRuleFieldValuesParams
): Promise<Result<EventAlertConditionRuleFieldValues>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  const queryParams = new URLSearchParams()

  if (params?.enabled !== undefined) {
    queryParams.append('enabled', String(params.enabled))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/eventAlertConditionRules:listFieldValues${queryString ? `?${queryString}` : ''}`
  debug('Fetching event alert condition rule field values:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as EventAlertConditionRuleFieldValues
    debug('Event alert condition rule field values fetched')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch field values: ${String(err)}`)
  }
}

/**
 * Get a specific event alert condition rule by ID.
 *
 * @remarks
 * Fetches a single event alert condition rule from
 * `/api/v3.0/eventAlertConditionRules/{id}`.
 *
 * @param ruleId - The unique identifier of the rule to fetch
 * @returns A Result containing the rule or an error
 *
 * @example
 * ```typescript
 * import { getEventAlertConditionRule } from 'een-api-toolkit'
 *
 * const { data, error } = await getEventAlertConditionRule('rule-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('Rule not found')
 *   }
 *   return
 * }
 *
 * console.log(`Rule: ${data.name}, Priority: ${data.priority}`)
 * ```
 *
 * @category Automations
 */
export async function getEventAlertConditionRule(
  ruleId: string
): Promise<Result<EventAlertConditionRule>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!ruleId) {
    return failure('VALIDATION_ERROR', 'Rule ID is required')
  }

  const url = `${baseUrl}/api/v3.0/eventAlertConditionRules/${encodeURIComponent(ruleId)}`
  debug('Fetching event alert condition rule:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as EventAlertConditionRule
    debug('Event alert condition rule fetched:', data.id)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch event alert condition rule: ${String(err)}`)
  }
}

// =============================================================================
// Alert Condition Rules
// =============================================================================

/**
 * List alert condition rules with optional filters and pagination.
 *
 * @remarks
 * Fetches a paginated list of alert condition rules from
 * `/api/v3.0/alertConditionRules`. These rules process events and create alerts.
 *
 * @param params - Optional filtering and pagination parameters
 * @returns A Result containing a paginated list of rules or an error
 *
 * @example
 * ```typescript
 * import { listAlertConditionRules } from 'een-api-toolkit'
 *
 * // Get enabled rules with actions
 * const { data, error } = await listAlertConditionRules({
 *   enabled: true,
 *   include: ['actions', 'insights']
 * })
 *
 * if (data) {
 *   data.results.forEach(rule => {
 *     console.log(`${rule.name}: ${rule.inputEventTypes.length} event types`)
 *   })
 * }
 * ```
 *
 * @category Automations
 */
export async function listAlertConditionRules(
  params?: ListAlertConditionRulesParams
): Promise<Result<PaginatedResult<AlertConditionRule>>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  const queryParams = new URLSearchParams()

  // Pagination
  if (params?.pageSize) {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }

  // Filters
  if (params?.enabled !== undefined) {
    queryParams.append('enabled', String(params.enabled))
  }
  if (params?.id__in && params.id__in.length > 0) {
    queryParams.append('id__in', params.id__in.join(','))
  }
  if (params?.actorId__in && params.actorId__in.length > 0) {
    queryParams.append('actorId__in', params.actorId__in.join(','))
  }
  if (params?.inputEventType__in && params.inputEventType__in.length > 0) {
    queryParams.append('inputEventType__in', params.inputEventType__in.join(','))
  }
  if (params?.outputAlertType) {
    queryParams.append('outputAlertType', params.outputAlertType)
  }
  if (params?.type) {
    queryParams.append('type', params.type)
  }

  // Response options
  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/alertConditionRules${queryString ? `?${queryString}` : ''}`
  debug('Fetching alert condition rules:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<AlertConditionRule>
    debug('Alert condition rules fetched:', data.results?.length ?? 0, 'rules')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch alert condition rules: ${String(err)}`)
  }
}

/**
 * Get a specific alert condition rule by ID.
 *
 * @remarks
 * Fetches a single alert condition rule from `/api/v3.0/alertConditionRules/{id}`.
 * Use the `include` parameter to request additional fields like actions or insights.
 *
 * @param ruleId - The unique identifier of the rule to fetch
 * @param params - Optional parameters (e.g., include additional fields)
 * @returns A Result containing the rule or an error
 *
 * @example
 * ```typescript
 * import { getAlertConditionRule } from 'een-api-toolkit'
 *
 * const { data, error } = await getAlertConditionRule('rule-123', {
 *   include: ['actions', 'insights']
 * })
 *
 * if (data) {
 *   console.log(`Rule: ${data.name}`)
 *   console.log(`Actions: ${data.actions?.length ?? 0}`)
 * }
 * ```
 *
 * @category Automations
 */
export async function getAlertConditionRule(
  ruleId: string,
  params?: GetAlertConditionRuleParams
): Promise<Result<AlertConditionRule>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!ruleId) {
    return failure('VALIDATION_ERROR', 'Rule ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/alertConditionRules/${encodeURIComponent(ruleId)}${queryString ? `?${queryString}` : ''}`
  debug('Fetching alert condition rule:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as AlertConditionRule
    debug('Alert condition rule fetched:', data.id)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch alert condition rule: ${String(err)}`)
  }
}

// =============================================================================
// Alert Action Rules
// =============================================================================

/**
 * List alert action rules with optional filters and pagination.
 *
 * @remarks
 * Fetches a paginated list of alert action rules from `/api/v3.0/alertActionRules`.
 * These rules connect alerts to actions - when an alert matches the rule's criteria,
 * the associated actions are executed.
 *
 * @param params - Optional filtering and pagination parameters
 * @returns A Result containing a paginated list of rules or an error
 *
 * @example
 * ```typescript
 * import { listAlertActionRules } from 'een-api-toolkit'
 *
 * // Get enabled rules for specific alert types
 * const { data, error } = await listAlertActionRules({
 *   enabled: true,
 *   alertType__in: ['een.motionDetectionAlert.v1']
 * })
 *
 * if (data) {
 *   data.results.forEach(rule => {
 *     console.log(`${rule.name}: ${rule.alertActionIds.length} actions`)
 *   })
 * }
 * ```
 *
 * @category Automations
 */
export async function listAlertActionRules(
  params?: ListAlertActionRulesParams
): Promise<Result<PaginatedResult<AlertActionRule>>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  const queryParams = new URLSearchParams()

  // Pagination
  if (params?.pageSize) {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }

  // Filters
  if (params?.enabled !== undefined) {
    queryParams.append('enabled', String(params.enabled))
  }
  if (params?.id__in && params.id__in.length > 0) {
    queryParams.append('id__in', params.id__in.join(','))
  }
  if (params?.alertType__in && params.alertType__in.length > 0) {
    queryParams.append('alertType__in', params.alertType__in.join(','))
  }
  if (params?.actorId__in && params.actorId__in.length > 0) {
    queryParams.append('actorId__in', params.actorId__in.join(','))
  }
  if (params?.alertActionId__in && params.alertActionId__in.length > 0) {
    queryParams.append('alertActionId__in', params.alertActionId__in.join(','))
  }
  if (params?.ruleId__in && params.ruleId__in.length > 0) {
    queryParams.append('ruleId__in', params.ruleId__in.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/alertActionRules${queryString ? `?${queryString}` : ''}`
  debug('Fetching alert action rules:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<AlertActionRule>
    debug('Alert action rules fetched:', data.results?.length ?? 0, 'rules')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch alert action rules: ${String(err)}`)
  }
}

/**
 * Get a specific alert action rule by ID.
 *
 * @remarks
 * Fetches a single alert action rule from `/api/v3.0/alertActionRules/{id}`.
 *
 * @param ruleId - The unique identifier of the rule to fetch
 * @returns A Result containing the rule or an error
 *
 * @example
 * ```typescript
 * import { getAlertActionRule } from 'een-api-toolkit'
 *
 * const { data, error } = await getAlertActionRule('rule-123')
 *
 * if (data) {
 *   console.log(`Rule: ${data.name}`)
 *   console.log(`Alert types: ${data.alertTypes.join(', ')}`)
 *   console.log(`Actions: ${data.alertActionIds.length}`)
 * }
 * ```
 *
 * @category Automations
 */
export async function getAlertActionRule(
  ruleId: string
): Promise<Result<AlertActionRule>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!ruleId) {
    return failure('VALIDATION_ERROR', 'Rule ID is required')
  }

  const url = `${baseUrl}/api/v3.0/alertActionRules/${encodeURIComponent(ruleId)}`
  debug('Fetching alert action rule:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as AlertActionRule
    debug('Alert action rule fetched:', data.id)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch alert action rule: ${String(err)}`)
  }
}

// =============================================================================
// Alert Actions
// =============================================================================

/**
 * List alert actions with optional filters and pagination.
 *
 * @remarks
 * Fetches a paginated list of alert actions from `/api/v3.0/alertActions`.
 * Alert actions define what happens when an alert is triggered (notifications,
 * webhooks, integrations, etc.).
 *
 * @param params - Optional filtering and pagination parameters
 * @returns A Result containing a paginated list of actions or an error
 *
 * @example
 * ```typescript
 * import { listAlertActions } from 'een-api-toolkit'
 *
 * // Get enabled webhook and notification actions
 * const { data, error } = await listAlertActions({
 *   enabled: true,
 *   type__in: ['notification', 'webhook']
 * })
 *
 * if (data) {
 *   data.results.forEach(action => {
 *     console.log(`${action.name} (${action.type})`)
 *   })
 * }
 * ```
 *
 * @category Automations
 */
export async function listAlertActions(
  params?: ListAlertActionsParams
): Promise<Result<PaginatedResult<AutomationAlertAction>>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  const queryParams = new URLSearchParams()

  // Pagination
  if (params?.pageSize) {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }

  // Filters
  if (params?.enabled !== undefined) {
    queryParams.append('enabled', String(params.enabled))
  }
  if (params?.id__in && params.id__in.length > 0) {
    queryParams.append('id__in', params.id__in.join(','))
  }
  if (params?.type__in && params.type__in.length > 0) {
    queryParams.append('type__in', params.type__in.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/alertActions${queryString ? `?${queryString}` : ''}`
  debug('Fetching alert actions:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<AutomationAlertAction>
    debug('Alert actions fetched:', data.results?.length ?? 0, 'actions')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch alert actions: ${String(err)}`)
  }
}

/**
 * Get a specific alert action by ID.
 *
 * @remarks
 * Fetches a single alert action from `/api/v3.0/alertActions/{id}`.
 *
 * @param actionId - The unique identifier of the action to fetch
 * @returns A Result containing the action or an error
 *
 * @example
 * ```typescript
 * import { getAlertAction } from 'een-api-toolkit'
 *
 * const { data, error } = await getAlertAction('action-123')
 *
 * if (data) {
 *   console.log(`Action: ${data.name} (${data.type})`)
 *   console.log('Settings:', data.settings)
 * }
 * ```
 *
 * @category Automations
 */
export async function getAlertAction(
  actionId: string
): Promise<Result<AutomationAlertAction>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!actionId) {
    return failure('VALIDATION_ERROR', 'Action ID is required')
  }

  const url = `${baseUrl}/api/v3.0/alertActions/${encodeURIComponent(actionId)}`
  debug('Fetching alert action:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as AutomationAlertAction
    debug('Alert action fetched:', data.id)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch alert action: ${String(err)}`)
  }
}
