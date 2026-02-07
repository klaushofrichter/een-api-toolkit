[**EEN API Toolkit v0.3.59**](../README.md)

***

[EEN API Toolkit](../README.md) / GetFileParams

# Interface: GetFileParams

Defined in: [src/types/file.ts:174](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L174)

Parameters for getting a single file.

## Remarks

Use to fetch file metadata before downloading.

## Properties

### include?

> `optional` **include**: [`FileIncludeField`](../type-aliases/FileIncludeField.md)[]

Defined in: [src/types/file.ts:180](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L180)

Additional fields to include in the response.
Valid values: accountId, publicShare, notes, createTimestamp,
updateTimestamp, size, metadata, tags, childCount, details
