[**EEN API Toolkit v0.3.73**](../README.md)

***

[EEN API Toolkit](../README.md) / FileIncludeField

# Type Alias: FileIncludeField

> **FileIncludeField** = `"accountId"` \| `"publicShare"` \| `"notes"` \| `"createTimestamp"` \| `"updateTimestamp"` \| `"size"` \| `"metadata"` \| `"tags"` \| `"childCount"` \| `"details"`

Defined in: [types/file.ts:27](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/file.ts#L27)

Valid include field names for the Files API.

## Remarks

These fields can be requested via the `include` parameter to get additional
file metadata that is not returned by default.

## Example

```typescript
const { data } = await listFiles({
  include: ['size', 'createTimestamp', 'tags', 'metadata']
})
```
