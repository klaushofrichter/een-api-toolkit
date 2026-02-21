[**EEN API Toolkit v0.3.86**](../README.md)

***

[EEN API Toolkit](../README.md) / downloadFile

# Function: downloadFile()

> **downloadFile**(`fileId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`DownloadFileResult`](../interfaces/DownloadFileResult.md)\>\>

Defined in: [files/service.ts:349](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/files/service.ts#L349)

Download a file's binary content.

## Parameters

### fileId

`string`

The unique identifier of the file to download

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`DownloadFileResult`](../interfaces/DownloadFileResult.md)\>\>

A Result containing the download result with blob, filename, and metadata

## Remarks

Downloads the actual file content from `/api/v3.0/files/{fileId}:download`.
Returns a Blob that can be used to create a download link or process the file.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/downloadfile).

## Example

```typescript
import { downloadFile } from 'een-api-toolkit'

const { data, error } = await downloadFile('file-123')

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
