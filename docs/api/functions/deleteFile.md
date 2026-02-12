[**EEN API Toolkit v0.3.71**](../README.md)

***

[EEN API Toolkit](../README.md) / deleteFile

# Function: deleteFile()

> **deleteFile**(`fileId`): `Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

Defined in: [files/service.ts:446](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/files/service.ts#L446)

Delete (recycle) a file by ID.

## Parameters

### fileId

`string`

The unique identifier of the file to delete

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<`void`\>\>

A Result indicating success or an error

## Remarks

Moves a file to the recycle bin (trash) via DELETE `/api/v3.0/files/{fileId}`.
This does not permanently delete the file - it can be recovered from trash.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/deletefile).

## Example

```typescript
import { deleteFile } from 'een-api-toolkit'

async function recycleFile(fileId: string) {
  const { error } = await deleteFile(fileId)

  if (error) {
    if (error.code === 'NOT_FOUND') {
      console.log('File not found or already deleted')
    } else {
      console.error('Failed to delete file:', error.message)
    }
    return false
  }

  console.log('File moved to trash')
  return true
}
```
