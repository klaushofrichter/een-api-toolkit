/**
 * Allowed domains for EEN API requests.
 * All API hostnames must match one of these domains (exact or subdomain).
 *
 * @internal
 */
const ALLOWED_DOMAINS = ['.eagleeyenetworks.com', '.een.cloud']

/**
 * Validates that a hostname belongs to a trusted EEN domain.
 *
 * @remarks
 * Checks against the allowlist of known EEN domains to prevent
 * token exfiltration via hostname poisoning. Allows both exact domain
 * matches (e.g., `eagleeyenetworks.com`) and subdomain matches
 * (e.g., `c001.eagleeyenetworks.com`).
 *
 * @param hostname - The hostname to validate (without protocol or port)
 * @returns `true` if the hostname is a trusted EEN domain
 *
 * @example
 * ```typescript
 * import { isAllowedEenHostname } from 'een-api-toolkit'
 *
 * isAllowedEenHostname('c001.eagleeyenetworks.com') // true
 * isAllowedEenHostname('evil.example.com')           // false
 * ```
 *
 * @category Utilities
 */
export function isAllowedEenHostname(hostname: string): boolean {
  if (!hostname || typeof hostname !== 'string') {
    return false
  }
  const normalized = hostname.toLowerCase().trim()
  if (!normalized) {
    return false
  }
  // Reject hostnames containing URL-structural characters to prevent
  // bypass attacks like "evil.com/.eagleeyenetworks.com"
  const VALID_HOSTNAME_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*$/
  if (!VALID_HOSTNAME_RE.test(normalized)) {
    return false
  }
  return ALLOWED_DOMAINS.some(domain =>
    normalized === domain.substring(1) || normalized.endsWith(domain)
  )
}
