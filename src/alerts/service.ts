import { useAuthStore } from '../auth/store'
import { success, failure } from '../types'
import type {
  Result,
  PaginatedResult,
  Alert,
  AlertType,
  ListAlertsParams,
  GetAlertParams,
  ListAlertTypesParams
} from '../types'
import { debug, formatTimestamp } from '../utils'

/**
 * List alerts with optional filters and pagination.
 *
 * @remarks
 * Fetches a paginated list of alerts from `/api/v3.0/alerts`. Supports various
 * filters including time range, actor, alert type, priority, and more.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listalerts).
 *
 * @param params - Optional filtering and pagination parameters
 * @returns A Result containing a paginated list of alerts or an error
 *
 * @example
 * ```typescript
 * import { listAlerts } from 'een-api-toolkit'
 *
 * // Get recent alerts from a specific camera
 * const { data, error } = await listAlerts({
 *   actorId__in: ['100d4c41'],
 *   timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
 *   pageSize: 50,
 *   include: ['data', 'actions']
 * })
 *
 * if (data) {
 *   console.log(`Found ${data.results.length} alerts`)
 *   data.results.forEach(alert => {
 *     console.log(`${alert.alertType} at ${alert.timestamp}`)
 *   })
 * }
 *
 * // Fetch all alerts with pagination
 * let allAlerts: Alert[] = []
 * let pageToken: string | undefined
 * do {
 *   const { data, error } = await listAlerts({
 *     timestamp__gte: new Date(Date.now() - 86400000).toISOString(),
 *     pageSize: 100,
 *     pageToken
 *   })
 *   if (error) break
 *   allAlerts.push(...data.results)
 *   pageToken = data.nextPageToken
 * } while (pageToken)
 * ```
 *
 * @category Alerts
 */
export async function listAlerts(params?: ListAlertsParams): Promise<Result<PaginatedResult<Alert>>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  const queryParams = new URLSearchParams()

  // Pagination
  if (params?.pageSize) {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }

  // Time filters
  if (params?.timestamp__lte) {
    queryParams.append('timestamp__lte', formatTimestamp(params.timestamp__lte))
  }
  if (params?.timestamp__gte) {
    queryParams.append('timestamp__gte', formatTimestamp(params.timestamp__gte))
  }

  // Entity filters
  if (params?.creatorId) {
    queryParams.append('creatorId', params.creatorId)
  }
  if (params?.alertType__in && params.alertType__in.length > 0) {
    queryParams.append('alertType__in', params.alertType__in.join(','))
  }
  if (params?.actorId__in && params.actorId__in.length > 0) {
    queryParams.append('actorId__in', params.actorId__in.join(','))
  }
  if (params?.actorType__in && params.actorType__in.length > 0) {
    queryParams.append('actorType__in', params.actorType__in.join(','))
  }
  if (params?.actorAccountId) {
    queryParams.append('actorAccountId', params.actorAccountId)
  }

  // Rule filters
  if (params?.ruleId) {
    queryParams.append('ruleId', params.ruleId)
  }
  if (params?.ruleId__in && params.ruleId__in.length > 0) {
    queryParams.append('ruleId__in', params.ruleId__in.join(','))
  }

  // Event and location filters
  if (params?.eventId) {
    queryParams.append('eventId', params.eventId)
  }
  if (params?.locationId__in && params.locationId__in.length > 0) {
    queryParams.append('locationId__in', params.locationId__in.join(','))
  }

  // Priority filters
  if (params?.priority__gte !== undefined) {
    queryParams.append('priority__gte', String(params.priority__gte))
  }
  if (params?.priority__lte !== undefined) {
    queryParams.append('priority__lte', String(params.priority__lte))
  }

  // Other filters
  if (params?.showInvalidAlerts !== undefined) {
    queryParams.append('showInvalidAlerts', String(params.showInvalidAlerts))
  }
  if (params?.alertActionId__in && params.alertActionId__in.length > 0) {
    queryParams.append('alertActionId__in', params.alertActionId__in.join(','))
  }
  if (params?.alertActionStatus__in && params.alertActionStatus__in.length > 0) {
    queryParams.append('alertActionStatus__in', params.alertActionStatus__in.join(','))
  }

  // Response options
  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }
  if (params?.sort && params.sort.length > 0) {
    queryParams.append('sort', params.sort.join(','))
  }
  if (params?.language) {
    queryParams.append('language', params.language)
  }

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/alerts${queryString ? `?${queryString}` : ''}`
  debug('Fetching alerts:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<Alert>
    debug('Alerts fetched:', data.results?.length ?? 0, 'alerts')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch alerts: ${String(err)}`)
  }
}

/**
 * Get a specific alert by ID.
 *
 * @remarks
 * Fetches a single alert from `/api/v3.0/alerts/{alertId}`. Use the `include`
 * parameter to request additional fields.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getalert).
 *
 * @param alertId - The unique identifier of the alert to fetch
 * @param params - Optional parameters (e.g., include additional fields)
 * @returns A Result containing the alert or an error
 *
 * @example
 * ```typescript
 * import { getAlert } from 'een-api-toolkit'
 *
 * const { data, error } = await getAlert('alert-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('Alert not found')
 *   }
 *   return
 * }
 *
 * console.log(`Alert: ${data.alertType} at ${data.timestamp}`)
 *
 * // With additional fields
 * const { data: alertWithData } = await getAlert('alert-123', {
 *   include: ['data', 'actions', 'description']
 * })
 * ```
 *
 * @category Alerts
 */
export async function getAlert(alertId: string, params?: GetAlertParams): Promise<Result<Alert>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!alertId) {
    return failure('VALIDATION_ERROR', 'Alert ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/alerts/${encodeURIComponent(alertId)}${queryString ? `?${queryString}` : ''}`
  debug('Fetching alert:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as Alert
    debug('Alert fetched:', data.id)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch alert: ${String(err)}`)
  }
}

/**
 * List all available alert types.
 *
 * @remarks
 * Fetches a paginated list of alert types from `/api/v3.0/alertTypes`. Alert types
 * describe the different kinds of alerts that can be generated in the system.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listalerttypes).
 *
 * @param params - Optional pagination parameters
 * @returns A Result containing a paginated list of alert types or an error
 *
 * @example
 * ```typescript
 * import { listAlertTypes } from 'een-api-toolkit'
 *
 * const { data, error } = await listAlertTypes()
 * if (data) {
 *   data.results.forEach(alertType => {
 *     console.log(`${alertType.type}: ${alertType.description}`)
 *   })
 * }
 *
 * // With pagination
 * const { data: pagedTypes } = await listAlertTypes({ pageSize: 20 })
 * ```
 *
 * @category Alerts
 */
export async function listAlertTypes(params?: ListAlertTypesParams): Promise<Result<PaginatedResult<AlertType>>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  const queryParams = new URLSearchParams()

  // Pagination
  if (params?.pageSize) {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/alertTypes${queryString ? `?${queryString}` : ''}`
  debug('Fetching alert types:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<AlertType>
    debug('Alert types fetched:', data.results?.length ?? 0, 'types')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch alert types: ${String(err)}`)
  }
}

/**
 * Handle error responses from the API.
 * @internal
 */
async function handleErrorResponse<T>(response: Response): Promise<Result<T>> {
  const status = response.status

  let message: string
  try {
    const errorData = await response.json()
    message = errorData.message ?? errorData.error ?? response.statusText
  } catch (parseError) {
    debug('Failed to parse error response JSON:', parseError)
    message = response.statusText || 'Unknown error'
  }

  switch (status) {
    case 401:
      return failure('AUTH_REQUIRED', `Authentication failed: ${message}`, status)
    case 403:
      return failure('FORBIDDEN', `Access denied: ${message}`, status)
    case 404:
      return failure('NOT_FOUND', `Not found: ${message}`, status)
    case 429:
      return failure('RATE_LIMITED', `Rate limited: ${message}`, status)
    default:
      return failure('API_ERROR', `API error: ${message}`, status)
  }
}
