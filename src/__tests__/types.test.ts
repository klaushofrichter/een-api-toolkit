import { describe, it, expect } from 'vitest'
import { success, failure } from '../types'
import type { Result } from '../types'

describe('Result type helpers', () => {
  describe('success', () => {
    it('should create a success result with data', () => {
      const result = success({ id: '123', name: 'test' })

      expect(result.data).toEqual({ id: '123', name: 'test' })
      expect(result.error).toBeNull()
    })

    it('should create a success result with null data', () => {
      const result = success(null)

      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
    })

    it('should create a success result with array data', () => {
      const result = success([1, 2, 3])

      expect(result.data).toEqual([1, 2, 3])
      expect(result.error).toBeNull()
    })
  })

  describe('failure', () => {
    it('should create a failure result with error', () => {
      const result = failure<string>('API_ERROR', 'Something went wrong')

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        code: 'API_ERROR',
        message: 'Something went wrong',
        status: undefined,
        details: undefined
      })
    })

    it('should create a failure result with status', () => {
      const result = failure<string>('NOT_FOUND', 'Resource not found', 404)

      expect(result.data).toBeNull()
      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.message).toBe('Resource not found')
      expect(result.error?.status).toBe(404)
    })

    it('should create a failure result with details', () => {
      const details = { field: 'email', reason: 'invalid' }
      const result = failure<string>('VALIDATION_ERROR', 'Invalid input', 400, details)

      expect(result.data).toBeNull()
      expect(result.error?.details).toEqual(details)
    })
  })

  describe('type narrowing', () => {
    it('should allow type narrowing based on error check', () => {
      const result: Result<{ id: string }> = success({ id: '123' })

      if (result.error) {
        // TypeScript knows result.data is null here
        expect(result.data).toBeNull()
      } else {
        // TypeScript knows result.data is { id: string } here
        expect(result.data.id).toBe('123')
      }
    })
  })
})
