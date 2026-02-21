[**EEN API Toolkit v0.3.88**](../README.md)

***

[EEN API Toolkit](../README.md) / getDownload

# Function: getDownload()

> **getDownload**(`downloadId`, `params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Download`](../interfaces/Download.md)\>\>

Defined in: [downloads/service.ts:161](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/downloads/service.ts#L161)

Get a specific download by ID.

## Parameters

### downloadId

`string`

The unique identifier of the download to fetch

### params?

[`GetDownloadParams`](../interfaces/GetDownloadParams.md)

Optional parameters (e.g., include additional fields)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Download`](../interfaces/Download.md)\>\>

A Result containing the download or an error

## Remarks

Fetches a single download's metadata from `/api/v3.0/downloads/{downloadId}`.
Use this to get download details before downloading.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getdownload).

## Example

```typescript
import { getDownload } from 'een-api-toolkit'

const { data, error } = await getDownload('download-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Download not found')
  }
  return
}

console.log(`Download: ${data.name} (${data.status})`)
if (data.status === 'available') {
  console.log(`Size: ${data.sizeBytes} bytes`)
}
```
