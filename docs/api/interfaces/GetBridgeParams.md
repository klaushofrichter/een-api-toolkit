[**EEN API Toolkit v0.3.8**](../README.md)

***

[EEN API Toolkit](../README.md) / GetBridgeParams

# Interface: GetBridgeParams

Defined in: [src/types/bridge.ts:243](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L243)

Parameters for getting a single bridge.

## Remarks

Valid include values: account, status, locationSummary, deviceAddress,
timeZone, notes, tags, devicePosition, networkInfo, deviceInfo,
effectivePermissions, firmware

## Example

```typescript
import { getBridge } from 'een-api-toolkit'

const { data } = await getBridge('bridge-123', {
  include: ['deviceInfo', 'status', 'networkInfo']
})
```

## Properties

### include?

> `optional` **include**: `string`[]

Defined in: [src/types/bridge.ts:250](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L250)

Additional fields to include in the response.
Valid values: account, status, locationSummary, deviceAddress,
timeZone, notes, tags, devicePosition, networkInfo, deviceInfo,
effectivePermissions, firmware
