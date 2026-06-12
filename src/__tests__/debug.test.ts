import { describe, it, expect } from 'vitest'
import { redactUrl } from '../utils/debug'

describe('redactUrl', () => {
  it('redacts the query string', () => {
    expect(redactUrl('https://media.c001.eagleeyenetworks.com/hls/session?sessionToken=secret123&expires=999')).toBe(
      'https://media.c001.eagleeyenetworks.com/hls/session?[redacted]'
    )
  })

  it('preserves origin and pathname when there is no query string', () => {
    expect(redactUrl('https://api.c001.eagleeyenetworks.com/api/v3.0/cameras')).toBe(
      'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras'
    )
  })

  it('preserves a non-default port', () => {
    expect(redactUrl('https://api.c001.eagleeyenetworks.com:8443/path?token=x')).toBe(
      'https://api.c001.eagleeyenetworks.com:8443/path?[redacted]'
    )
  })

  it('returns a placeholder for unparseable URLs', () => {
    expect(redactUrl('not a url')).toBe('[invalid URL]')
    expect(redactUrl('')).toBe('[invalid URL]')
  })
})
