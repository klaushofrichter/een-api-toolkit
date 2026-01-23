[**EEN API Toolkit v0.3.26**](../README.md)

***

[EEN API Toolkit](../README.md) / MetricDataPoint

# Type Alias: MetricDataPoint

> **MetricDataPoint** = \[`number`, `number`\]

Defined in: [src/types/eventMetric.ts:35](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L35)

A single metric data point as [timestamp_ms, value].

## Remarks

Event metrics return time-series data as arrays of [timestamp, value] pairs.
The timestamp is in milliseconds since Unix epoch, and the value represents
the count or measurement at that point in time.

## Example

```typescript
// Data point: January 1, 2024 at midnight with a count of 5
const dataPoint: MetricDataPoint = [1704067200000, 5]
```
