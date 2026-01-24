/**
 * API Helper for E2E Tests
 *
 * Provides reusable functions for making authenticated API requests.
 */

import { APIRequestContext } from '@playwright/test'
import { AuthState } from './auth-helper'

/**
 * Make an authenticated GET request to the EEN API.
 */
export async function apiGet(
  request: APIRequestContext,
  auth: AuthState,
  endpoint: string,
  params?: Record<string, string>
) {
  return request.get(`${auth.baseUrl}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${auth.token}`
    },
    params
  })
}

/**
 * Make an authenticated POST request to the EEN API.
 */
export async function apiPost(
  request: APIRequestContext,
  auth: AuthState,
  endpoint: string,
  data?: unknown
) {
  return request.post(`${auth.baseUrl}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`
    },
    data
  })
}

/**
 * Make an authenticated PATCH request to the EEN API.
 */
export async function apiPatch(
  request: APIRequestContext,
  auth: AuthState,
  endpoint: string,
  data?: unknown
) {
  return request.patch(`${auth.baseUrl}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`
    },
    data
  })
}

/**
 * Make an authenticated DELETE request to the EEN API.
 */
export async function apiDelete(
  request: APIRequestContext,
  auth: AuthState,
  endpoint: string
) {
  return request.delete(`${auth.baseUrl}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${auth.token}`
    }
  })
}

/**
 * Make an unauthenticated GET request (for testing 401 errors).
 */
export async function apiGetUnauthenticated(
  request: APIRequestContext,
  baseUrl: string,
  endpoint: string,
  token: string = 'invalid-token'
) {
  return request.get(`${baseUrl}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
}
