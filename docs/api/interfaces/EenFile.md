[**EEN API Toolkit v0.3.73**](../README.md)

***

[EEN API Toolkit](../README.md) / EenFile

# Interface: EenFile

Defined in: [types/file.ts:60](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L60)

File entity from EEN API v3.0.

## Remarks

Represents a file stored in the Eagle Eye Networks platform.
Files can be exports, uploads, or snapshots.

## Example

```typescript
import { listFiles, type EenFile } from 'een-api-toolkit'

const { data, error } = await listFiles({ type__in: ['export'] })
if (data) {
  data.results.forEach((file: EenFile) => {
    console.log(`${file.name}: ${file.size} bytes`)
  })
}
```

## Properties

### id

> **id**: `string`

Defined in: [types/file.ts:62](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L62)

Unique identifier for the file

***

### name

> **name**: `string`

Defined in: [types/file.ts:64](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L64)

Display name of the file

***

### mimeType?

> `optional` **mimeType**: `string`

Defined in: [types/file.ts:66](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L66)

MIME type from API (e.g., 'video/mp4', 'application/directory')

***

### directory?

> `optional` **directory**: `string`

Defined in: [types/file.ts:68](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L68)

Directory path

***

### accountId?

> `optional` **accountId**: `string`

Defined in: [types/file.ts:73](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L73)

ID of the account this file belongs to (requires include=accountId)

***

### publicShare?

> `optional` **publicShare**: `unknown`

Defined in: [types/file.ts:75](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L75)

Public share information (requires include=publicShare)

***

### notes?

> `optional` **notes**: `string`

Defined in: [types/file.ts:77](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L77)

File notes/description (requires include=notes)

***

### createTimestamp?

> `optional` **createTimestamp**: `string`

Defined in: [types/file.ts:79](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L79)

ISO 8601 timestamp when the file was created (requires include=createTimestamp)

***

### updateTimestamp?

> `optional` **updateTimestamp**: `string`

Defined in: [types/file.ts:81](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L81)

ISO 8601 timestamp when the file was last updated (requires include=updateTimestamp)

***

### size?

> `optional` **size**: `number`

Defined in: [types/file.ts:83](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L83)

File size in bytes (requires include=size)

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [types/file.ts:85](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L85)

Additional metadata (requires include=metadata)

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [types/file.ts:87](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L87)

Tags for categorization (requires include=tags)

***

### childCount?

> `optional` **childCount**: `number`

Defined in: [types/file.ts:89](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L89)

Number of child files for directories (requires include=childCount)

***

### details?

> `optional` **details**: `Record`\<`string`, `unknown`\>

Defined in: [types/file.ts:91](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L91)

Additional file details (requires include=details)

***

### filename?

> `optional` **filename**: `string`

Defined in: [types/file.ts:96](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L96)

Original filename

***

### contentType?

> `optional` **contentType**: `string`

Defined in: [types/file.ts:98](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L98)

MIME content type (e.g., 'video/mp4', 'image/jpeg')

***

### type?

> `optional` **type**: [`FileType`](../type-aliases/FileType.md)

Defined in: [types/file.ts:100](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L100)

Type/category of the file

***

### jobId?

> `optional` **jobId**: `string`

Defined in: [types/file.ts:102](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L102)

ID of the job that created this file (for exports)

***

### cameraId?

> `optional` **cameraId**: `string`

Defined in: [types/file.ts:104](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L104)

ID of the camera this file relates to

***

### description?

> `optional` **description**: `string`

Defined in: [types/file.ts:106](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L106)

Description or notes about the file

***

### expirationTimestamp?

> `optional` **expirationTimestamp**: `string`

Defined in: [types/file.ts:108](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L108)

ISO 8601 timestamp when the file expires (if applicable)
