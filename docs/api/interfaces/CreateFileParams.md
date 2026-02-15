[**EEN API Toolkit v0.3.82**](../README.md)

***

[EEN API Toolkit](../README.md) / CreateFileParams

# Interface: CreateFileParams

Defined in: [types/file.ts:203](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L203)

Parameters for adding/uploading a file.

## Remarks

Creates a new file entry. The actual file content may be uploaded
separately or referenced by URL.

## Example

```typescript
import { addFile } from 'een-api-toolkit'

const { data, error } = await addFile({
  name: 'Incident Report',
  type: 'upload',
  description: 'Security incident documentation'
})
```

## Properties

### name

> **name**: `string`

Defined in: [types/file.ts:205](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L205)

Display name for the file

***

### type?

> `optional` **type**: [`FileType`](../type-aliases/FileType.md)

Defined in: [types/file.ts:207](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L207)

Type/category of the file

***

### filename?

> `optional` **filename**: `string`

Defined in: [types/file.ts:209](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L209)

Original filename

***

### description?

> `optional` **description**: `string`

Defined in: [types/file.ts:211](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L211)

Description or notes about the file

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [types/file.ts:213](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L213)

Tags for categorization

***

### cameraId?

> `optional` **cameraId**: `string`

Defined in: [types/file.ts:215](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L215)

Related camera ID
