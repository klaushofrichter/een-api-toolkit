[**EEN API Toolkit v0.3.74**](../README.md)

***

[EEN API Toolkit](../README.md) / downloadDownload

# Function: downloadDownload()

> **downloadDownload**(`downloadId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`DownloadFileResult`](../interfaces/DownloadFileResult.md)\>\>

Defined in: [downloads/service.ts:245](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/downloads/service.ts#L245)

Download the binary content of a download entry.

## Parameters

### downloadId

`string`

The unique identifier of the download to fetch

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`DownloadFileResult`](../interfaces/DownloadFileResult.md)\>\>

A Result containing the download result with blob, filename, and metadata

## Remarks

Downloads the actual file content from `/api/v3.0/downloads/{downloadId}:download`.
Returns a Blob that can be used to create a download link or process the file.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/downloaddownload).

## Example

```typescript
import { downloadDownload } from 'een-api-toolkit'

const { data, error } = await downloadDownload('download-123')

if (error) {
  console.error('Download failed:', error.message)
  return
}

// Create download link
const url = URL.createObjectURL(data.blob)
const a = document.createElement('a')
a.href = url
a.download = data.filename
a.click()
URL.revokeObjectURL(url)

console.log(`Downloaded: ${data.filename} (${data.size} bytes)`)
```
