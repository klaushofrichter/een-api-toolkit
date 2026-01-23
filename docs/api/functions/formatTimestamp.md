[**EEN API Toolkit v0.3.23**](../README.md)

***

[EEN API Toolkit](../README.md) / formatTimestamp

# Function: formatTimestamp()

> **formatTimestamp**(`timestamp`): `string`

Defined in: [src/utils/timestamp.ts:23](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/utils/timestamp.ts#L23)

Convert ISO 8601 timestamp from Z format to +00:00 format.

## Parameters

### timestamp

`string`

ISO 8601 timestamp string

## Returns

`string`

Timestamp in +00:00 format

## Remarks

The EEN API requires timestamps in +00:00 format, not Z format.
This function converts timestamps like `2024-01-01T00:00:00.000Z`
to `2024-01-01T00:00:00.000+00:00`.

## Example

```typescript
formatTimestamp('2024-01-01T00:00:00.000Z')
// Returns: '2024-01-01T00:00:00.000+00:00'

formatTimestamp(new Date().toISOString())
// Returns: timestamp with +00:00 suffix
```
