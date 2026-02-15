[**EEN API Toolkit v0.3.82**](../README.md)

***

[EEN API Toolkit](../README.md) / DownloadFileResult

# Interface: DownloadFileResult

Defined in: [types/file.ts:243](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L243)

Result from downloading a file.

## Remarks

Contains the binary file data as a Blob along with metadata.

## Example

```typescript
import { downloadFile } from 'een-api-toolkit'

const { data, error } = await downloadFile('file-123')

if (data) {
  // Create download link
  const url = URL.createObjectURL(data.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = data.filename
  a.click()
  URL.revokeObjectURL(url)
}
```

## Properties

### blob

> **blob**: `Blob`

Defined in: [types/file.ts:245](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L245)

Binary file data

***

### filename

> **filename**: `string`

Defined in: [types/file.ts:247](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L247)

Filename from Content-Disposition header

***

### contentType

> **contentType**: `string`

Defined in: [types/file.ts:249](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L249)

MIME content type from Content-Type header

***

### size

> **size**: `number`

Defined in: [types/file.ts:251](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L251)

File size in bytes
