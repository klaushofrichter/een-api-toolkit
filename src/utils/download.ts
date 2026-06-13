/**
 * Shared helper for downloading binary content from EEN API endpoints.
 *
 * Both `downloadFile` (files) and `downloadDownload` (downloads) perform the
 * same authenticated blob GET, Content-Disposition filename extraction, and
 * result assembly. The logic lives here once so behavior cannot drift.
 */

import { success, failure } from '../types'
import type { Result, DownloadFileResult } from '../types'
import { handleErrorResponse } from './api'

/**
 * Perform an authenticated GET of a binary resource and assemble the
 * standard download result (blob, filename, content type, size).
 *
 * @remarks
 * The request intentionally sends only the `Authorization` header (no
 * `Accept: application/json`) because these endpoints return binary content.
 * The filename is parsed from the `Content-Disposition` response header and
 * defaults to `'download'`; the content type defaults to
 * `'application/octet-stream'`.
 *
 * @param url - The fully constructed download URL
 * @param token - The access token from the auth store
 * @param networkErrorPrefix - Prefix for the NETWORK_ERROR message (the
 *   caught error is appended), preserving each caller's original wording
 * @returns A Result containing the blob, filename, content type, and size
 *
 * @internal
 */
export async function downloadBlob(
  url: string,
  token: string | null,
  networkErrorPrefix: string
): Promise<Result<DownloadFileResult>> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    // Get the blob data
    const blob = await response.blob()

    // Parse filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = 'download'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }

    // Get content type
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream'

    return success({
      blob,
      filename,
      contentType,
      size: blob.size
    })
  } catch (err) {
    return failure('NETWORK_ERROR', `${networkErrorPrefix}${String(err)}`)
  }
}
