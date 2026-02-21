[**EEN API Toolkit v0.3.91**](../README.md)

***

[EEN API Toolkit](../README.md) / getFile

# Function: getFile()

> **getFile**(`fileId`, `params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`EenFile`](../interfaces/EenFile.md)\>\>

Defined in: [files/service.ts:168](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/files/service.ts#L168)

Get a specific file by ID.

## Parameters

### fileId

`string`

The unique identifier of the file to fetch

### params?

[`GetFileParams`](../interfaces/GetFileParams.md)

Optional parameters (e.g., include additional fields)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`EenFile`](../interfaces/EenFile.md)\>\>

A Result containing the file or an error

## Remarks

Fetches a single file's metadata from `/api/v3.0/files/{fileId}`.
Use this to get file details before downloading.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getfile).

## Example

```typescript
import { getFile } from 'een-api-toolkit'

const { data, error } = await getFile('file-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('File not found')
  }
  return
}

console.log(`File: ${data.name} (${data.size} bytes)`)
```
