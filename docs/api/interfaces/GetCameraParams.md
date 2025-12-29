[**EEN API Toolkit v0.0.13**](../README.md)

***

[EEN API Toolkit](../README.md) / GetCameraParams

# Interface: GetCameraParams

Defined in: src/types/camera.ts:359

Parameters for getting a single camera.

## Remarks

Valid include values: bridge, account, status, locationSummary, deviceAddress,
timeZone, notes, tags, devicePosition, networkInfo, deviceInfo, effectivePermissions,
firmware, shareDetails, visibleByBridges, capabilities, analog, packages,
dewarpConfig, adminCredentials, publicSafetySharing, enabledAnalytics

## Example

```typescript
import { getCamera } from 'een-api-toolkit'

const { data } = await getCamera('camera-123', {
  include: ['deviceInfo', 'status', 'shareDetails']
})
```

## Properties

### include?

> `optional` **include**: `string`[]

Defined in: src/types/camera.ts:368

Additional fields to include in the response.
Valid values: bridge, account, status, locationSummary, deviceAddress,
timeZone, notes, tags, devicePosition, networkInfo, deviceInfo,
effectivePermissions, firmware, shareDetails, visibleByBridges,
capabilities, analog, packages, dewarpConfig, adminCredentials,
publicSafetySharing, enabledAnalytics
