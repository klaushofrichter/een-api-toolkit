import { describe, it, expect } from 'vitest'
import { formatTimestamp } from '../utils/timestamp'

describe('formatTimestamp', () => {
  describe('Z suffix conversion', () => {
    it('converts Z suffix to +00:00', () => {
      const result = formatTimestamp('2024-01-01T00:00:00.000Z')
      expect(result).toBe('2024-01-01T00:00:00.000+00:00')
    })

    it('converts Z suffix without milliseconds', () => {
      const result = formatTimestamp('2024-01-01T12:30:45Z')
      expect(result).toBe('2024-01-01T12:30:45+00:00')
    })

    it('handles timestamps from Date.toISOString()', () => {
      const date = new Date('2024-06-15T14:30:00Z')
      const isoString = date.toISOString()
      const result = formatTimestamp(isoString)
      expect(result.endsWith('+00:00')).toBe(true)
      expect(result.endsWith('Z')).toBe(false)
    })
  })

  describe('already in +00:00 format', () => {
    it('returns unchanged if already in +00:00 format', () => {
      const timestamp = '2024-01-01T00:00:00.000+00:00'
      const result = formatTimestamp(timestamp)
      expect(result).toBe(timestamp)
    })

    it('preserves +00:00 format without milliseconds', () => {
      const timestamp = '2024-01-01T12:30:45+00:00'
      const result = formatTimestamp(timestamp)
      expect(result).toBe(timestamp)
    })
  })

  describe('other timezone offsets', () => {
    it('returns unchanged for positive timezone offset', () => {
      const timestamp = '2024-01-01T12:00:00.000+05:30'
      const result = formatTimestamp(timestamp)
      expect(result).toBe(timestamp)
    })

    it('returns unchanged for negative timezone offset', () => {
      const timestamp = '2024-01-01T12:00:00.000-08:00'
      const result = formatTimestamp(timestamp)
      expect(result).toBe(timestamp)
    })
  })

  describe('malformed or edge case inputs', () => {
    it('returns unchanged for empty string', () => {
      const result = formatTimestamp('')
      expect(result).toBe('')
    })

    it('returns unchanged for date-only string', () => {
      const timestamp = '2024-01-01'
      const result = formatTimestamp(timestamp)
      expect(result).toBe(timestamp)
    })

    it('returns unchanged for timestamp without timezone', () => {
      const timestamp = '2024-01-01T12:00:00.000'
      const result = formatTimestamp(timestamp)
      expect(result).toBe(timestamp)
    })

    it('returns unchanged for arbitrary string', () => {
      const timestamp = 'not-a-timestamp'
      const result = formatTimestamp(timestamp)
      expect(result).toBe(timestamp)
    })

    it('handles Z in the middle of string (edge case)', () => {
      // This is not a valid ISO timestamp but tests that we only match Z at the end
      const timestamp = 'Z2024-01-01T12:00:00'
      const result = formatTimestamp(timestamp)
      expect(result).toBe(timestamp)
    })
  })

  describe('idempotency', () => {
    it('is idempotent - calling twice gives same result', () => {
      const timestamp = '2024-01-01T00:00:00.000Z'
      const firstResult = formatTimestamp(timestamp)
      const secondResult = formatTimestamp(firstResult)
      expect(secondResult).toBe(firstResult)
      expect(secondResult).toBe('2024-01-01T00:00:00.000+00:00')
    })
  })
})
