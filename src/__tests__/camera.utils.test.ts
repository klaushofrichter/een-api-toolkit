import { describe, it, expect } from 'vitest'
import { getCameraStatusString, isStatusObject } from '../utils/camera'
import type { CameraStatus } from '../types/camera'

describe('getCameraStatusString', () => {
  describe('string status values', () => {
    it('returns status when status is a string', () => {
      const result = getCameraStatusString('online')
      expect(result).toBe('online')
    })

    it('handles all valid CameraStatus string values', () => {
      const statuses: CameraStatus[] = [
        'online',
        'offline',
        'deviceOffline',
        'bridgeOffline',
        'invalidCredentials',
        'error',
        'streaming',
        'registered',
        'attaching',
        'initializing'
      ]

      for (const status of statuses) {
        const result = getCameraStatusString(status)
        expect(result).toBe(status)
      }
    })
  })

  describe('object status values', () => {
    it('extracts connectionStatus from object', () => {
      const result = getCameraStatusString({ connectionStatus: 'online' })
      expect(result).toBe('online')
    })

    it('returns undefined when connectionStatus is undefined', () => {
      const result = getCameraStatusString({ connectionStatus: undefined })
      expect(result).toBeUndefined()
    })

    it('handles all valid CameraStatus values in object', () => {
      const statuses: CameraStatus[] = [
        'online',
        'offline',
        'deviceOffline',
        'bridgeOffline',
        'invalidCredentials',
        'error',
        'streaming',
        'registered',
        'attaching',
        'initializing'
      ]

      for (const status of statuses) {
        const result = getCameraStatusString({ connectionStatus: status })
        expect(result).toBe(status)
      }
    })
  })

  describe('undefined and null values', () => {
    it('returns undefined when status is undefined', () => {
      const result = getCameraStatusString(undefined)
      expect(result).toBeUndefined()
    })

    it('returns undefined when status is empty object', () => {
      const result = getCameraStatusString({})
      expect(result).toBeUndefined()
    })
  })

  describe('type safety', () => {
    it('correctly handles union type parameter', () => {
      const stringStatus: CameraStatus = 'online'
      const objectStatus: { connectionStatus?: CameraStatus } = { connectionStatus: 'offline' }

      expect(getCameraStatusString(stringStatus)).toBe('online')
      expect(getCameraStatusString(objectStatus)).toBe('offline')
    })
  })
})

describe('isStatusObject', () => {
  describe('type guard for objects', () => {
    it('returns true for object with connectionStatus', () => {
      const status = { connectionStatus: 'online' as CameraStatus }
      expect(isStatusObject(status)).toBe(true)

      // Type narrowing verification
      if (isStatusObject(status)) {
        // This should compile without errors
        const connectionStatus: CameraStatus | undefined = status.connectionStatus
        expect(connectionStatus).toBe('online')
      }
    })

    it('returns true for empty object (matches API flexibility)', () => {
      const status = {}
      expect(isStatusObject(status)).toBe(true)
    })

    it('returns true for object with additional properties', () => {
      const status = { connectionStatus: 'online' as CameraStatus, otherProp: 'value' }
      expect(isStatusObject(status)).toBe(true)
    })
  })

  describe('type guard for strings', () => {
    it('returns false for string status', () => {
      const status: CameraStatus = 'online'
      expect(isStatusObject(status)).toBe(false)
    })

    it('returns false for all CameraStatus string values', () => {
      const statuses: CameraStatus[] = [
        'online',
        'offline',
        'deviceOffline',
        'bridgeOffline',
        'invalidCredentials',
        'error',
        'streaming',
        'registered',
        'attaching',
        'initializing'
      ]

      for (const status of statuses) {
        expect(isStatusObject(status)).toBe(false)
      }
    })
  })

  describe('null and undefined values', () => {
    it('returns false for undefined', () => {
      expect(isStatusObject(undefined)).toBe(false)
    })

    it('returns false for null (explicit null check)', () => {
      expect(isStatusObject(null as any)).toBe(false)
    })
  })

  describe('integration with getCameraStatusString', () => {
    it('works together for type-safe status extraction', () => {
      const statuses: Array<CameraStatus | { connectionStatus?: CameraStatus } | undefined> = [
        'online',
        { connectionStatus: 'offline' },
        undefined,
        'streaming',
        { connectionStatus: 'error' }
      ]

      for (const status of statuses) {
        if (isStatusObject(status)) {
          // TypeScript knows this is an object
          expect(typeof status).toBe('object')
          expect(getCameraStatusString(status)).toBe(status.connectionStatus)
        } else {
          // TypeScript knows this is a string or undefined
          expect(['string', 'undefined']).toContain(typeof status)
          expect(getCameraStatusString(status)).toBe(status)
        }
      }
    })
  })

  describe('practical usage scenarios', () => {
    it('enables conditional logic based on status format', () => {
      const stringStatus: CameraStatus = 'online'
      const objectStatus = { connectionStatus: 'offline' as CameraStatus }

      // String status
      if (isStatusObject(stringStatus)) {
        // Should not reach here
        expect.fail('Should not treat string as object')
      } else {
        expect(stringStatus).toBe('online')
      }

      // Object status
      if (isStatusObject(objectStatus)) {
        expect(objectStatus.connectionStatus).toBe('offline')
      } else {
        // Should not reach here
        expect.fail('Should treat object as object')
      }
    })
  })
})
