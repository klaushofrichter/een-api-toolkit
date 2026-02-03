[**EEN API Toolkit v0.3.51**](../README.md)

***

[EEN API Toolkit](../README.md) / addFile

# Function: addFile()

> **addFile**(`params`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`EenFile`](../interfaces/EenFile.md)\>\>

Defined in: [src/files/service.ts:245](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/files/service.ts#L245)

Add/create a new file entry.

## Parameters

### params

[`CreateFileParams`](../interfaces/CreateFileParams.md)

File creation parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`EenFile`](../interfaces/EenFile.md)\>\>

A Result containing the created file or an error

## Remarks

Creates a new file entry from `/api/v3.0/files`. The actual file content
may be uploaded separately or referenced by URL.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/createfile).

## Example

```typescript
import { addFile } from 'een-api-toolkit'

const { data, error } = await addFile({
  name: 'Incident Report',
  type: 'upload',
  description: 'Security incident documentation'
})

if (data) {
  console.log('File created:', data.id)
}
```
